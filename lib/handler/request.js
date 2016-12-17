import http from 'http'
import https from 'https'
import url from 'url'
import net from 'net'
import zlib from 'zlib'
import tls from 'tls'

import CA from './ca'
import record from  './record'

import responder from '../responder'

import util from '../util'
import config from '../config'
import transform from './transform'
import vorlonDelegate from '../vorlon'

let createSecureContext = tls.createSecureContext

let portrange = 40000
const MAX_POST = 60000
function getPort(cb) {
    let port = ++portrange

    if (portrange > MAX_POST) {
        portrange = 40000
    }

    var server = net.createServer()

    server.listen(port, (err) => {
        server.once('close', () => {
            cb(port)
        })

        server.close()
    });

    server.on('error', (err) => {
        getPort(cb)
    });
}

function httpRequestHandler(req, res) {
    let nreq = {}

    // allow responder
    if (config.enableRule) {
        let activeRuleList = Object.keys(config.ruleList).filter((v) => {
            return config.ruleList[v].checked
        })

        if (activeRuleList && activeRuleList.length) {
            for (let i = 0; i < activeRuleList.length; i++) {
                let rt = responder(config.ruleList[activeRuleList[i]], req, res)

                if (rt && rt.options) {
                    nreq.options = nreq.options || []

                    nreq.options.push(rt.options)
                }
                else {
                    Object.assign(nreq, rt)
                }
            }
        }
    }

    if (config.vorlon) {
        config.vorlon.forEach((vl) => {
            if (/^\s*\/\//.test(vl)) {
                return
            }

            let vr = {
                checked: true,
                pattern: vl,
                respond: vorlonDelegate.injectScriptToHTML()
            }

            let rt = responder(vr, req, res)

            if (rt && rt.options) {
                nreq.options = nreq.options || []

                nreq.options.push(rt.options)
            }
            else {
                Object.assign(nreq, rt)
            }
        })
    }

    req = (nreq && nreq.req) || req

    transform(nreq && nreq.options, req, res)

    let u = url.parse(req.url, true)

    let protocol = util.hasProtocol(u.protocol) && u.protocol.slice(0, -1).toLowerCase() || 'https'

    let fullUrl = protocol + '://' + req.headers.host + u.path;

    u = url.parse(fullUrl, true)

    let idx = record.add({
        // now can't get status(it's in response)
        status: '-',

        // transform to HTTP
        protocol: protocol.toUpperCase(),

        httpVersion: req.httpVersion,

        query: u.query,

        method: req.method,

        host: req.headers.host,

        path: u.path,

        serverIp: '-',

        url: fullUrl,

        // now can't get content-length(it's in response)
        contentLength: -1,

        reqHeader: util.extend({}, req.headers),

        reqTime: +new Date()
    })

    let options = {
        hostname: u.hostname || req.headers.host,
        port: u.port || (/https/i.test(protocol) ? 443 : 80),
        path: u.path,
        method: req.method,
        headers: req.headers
    }

    let sender = /https/i.test(protocol) ? https : http

    let next = function (idx, cRes, bodyLength, chunks) {
        chunks = chunks || ''

        let resBody = chunks.toString()

        record.update(idx, {
            resHeader: util.extend({}, cRes.headers),

            status: cRes.statusCode,

            statusMessage: cRes.statusMessage,

            contentType: cRes.headers && cRes.headers['content-type'],

            // GZip的大小
            bodyLength: bodyLength || resBody.length,

            // 实际内容的大小
            contentLength: cRes.headers['content-length'] || resBody.length,

            resBody: resBody,

            resTime: +new Date()
        })

        res.writeHead(cRes.statusCode, cRes.headers)

        res.write(Buffer.isBuffer(chunks) ? chunks : new Buffer(chunks))

        let transformedBody = res.end()

        try {
            record.update(idx, {
                resBody: transformedBody.toString()
            })
        }
        catch (e) {
            console.log('err')
        }
    }

    // redirect modify response
    if ((config.modifiedResponse || []).some((mr) => {
        if ((req.headers.host + u.path).indexOf(mr.fullUrl) > -1) {
            next(idx, {
                statusCode: 200,
                statusMessage: 'OK',
                headers: mr.header
            }, null, mr.content)
            return true
        }
    })) {
        return
    }

    // local file
    if (nreq && nreq.readStream) {
        let chunks = []
        let readLen = 0

        let cRes = {
            statusCode: 200,

            statusMessage: 'OK',

            ...nreq.headers
        }

        nreq.readStream.on('data', (chunk) => {
            chunks.push(chunk)
            readLen += chunk.length
        })

        nreq.readStream.on('end', () => {
            switch (chunks.length) {
                case 0:
                    chunk = new Buffer(0)
                    break
                case 1:
                    chunk = chunks[1]
                    break
                default:
                    chunk = new Buffer(readLen)

                    for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
                        let ck = chunks[i]

                        ck.copy(chunk, pos)

                        pos += ck.length
                    }
                    break
            }

            next(idx, cRes, null, chunk)
        })

        return
    }

    // remote request
    let proxyRequest = function (idx, postData) {

        // self signed
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let pReq = sender.request(options, (pRes) => {
            let chunks = [];

            pRes.on('data', (chunk) => {
                chunks.push(chunk)
            })

            pRes.on('end', () => {
                chunks = Buffer.concat(chunks)

                if (/gzip/i.test(pRes.headers['content-encoding'])) {
                    zlib.unzip(chunks, function (err, buffer) {
                        if (err) {
                            return
                        }

                        next(idx, pRes, chunks.toString().length, buffer)
                    })

                    return
                }

                next(idx, pRes, null, chunks)
            })
        })

        pReq.on('error', (e) => {
            res.writeHead(404)

            res.end()
        })

        postData && pReq.write(postData)

        pReq.end()
    }

    // post data
    if (util.isContainBodyData(req.method)) {
        let body = []

        req.on('data', (chunk) => {
            body.push(chunk)
        })

        req.on('end', () => {
            record.update(idx, {
                reqBody: body.toString()
            })

            proxyRequest(idx, Buffer.concat(body))
        })

        return
    }

    proxyRequest(idx)
}

function connectReqHandler(req, cltSocket, head) {
    let hostname

    let port

    // 解密 HTTPS
    if (config.interceptHttps) {
        getPort((p) => {

            let kc = CA.createCAForHostname('idev_https_proxy')

            https.createServer(Object.assign({
                SNICallback: (serverName, callback) => {
                    let ctx = createSecureContext(CA.createCAForHostname(serverName))

                    if (callback) {
                        callback(null, ctx)
                    }
                    else {
                        return ctx
                    }
                }
            }, kc), httpRequestHandler).listen(p)

            hostname = config.host;

            port = p;

            let srvSocket = net.connect(port, hostname, function () {
                cltSocket.write('HTTP/' + req.httpVersion + ' 200 Connection Established\r\nProxy-agent: idev-Proxy\r\n\r\n')

                srvSocket.write(head)

                srvSocket.pipe(cltSocket)

                cltSocket.pipe(srvSocket)
            })

            srvSocket.on('error', () => {
                console.error('https connect error: ' + req.url)

                cltSocket.end()
            })
        })
    }
    else {
        hostname = req.url.split(':')[0]

        port = req.url.split(':')[1]

        let srvSocket = net.connect(port, hostname, function () {
            cltSocket.write('HTTP/' + req.httpVersion + ' 200 Connection Established\r\nProxy-agent: idev-Proxy\r\n\r\n')

            srvSocket.write(head)

            srvSocket.pipe(cltSocket)

            cltSocket.pipe(srvSocket)
        })

        srvSocket.on('error', () => {
            console.error('https connect error: ' + req.url)

            cltSocket.end()
        })
    }
}

export default {
    httpRequestHandler,

    connectReqHandler
}
