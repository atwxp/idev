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

    let nreq

    // allow responder
    if (config.enableRule) {
        let activeRuleList = Object.keys(config.ruleList).filter((v) => {
            return config.ruleList[v].checked
        })

        if (activeRuleList && activeRuleList.length) {
            for (let i = 0; i < activeRuleList.length; i++) {
                if (nreq = responder(config.ruleList[activeRuleList[i]], req, res)) {
                    break
                }
            }
        }
    }

    req = (nreq && nreq.req) || req

    let u = url.parse(req.url, true)

    let protocol = util.hasProtocol(u.protocol) && u.protocol.slice(0, -1).toUpperCase() || 'HTTPS'

    let idx = record.add({
        // now can't get status(it's in response)
        status: '-',

        // transform to HTTP
        protocol: protocol,

        httpVersion: req.httpVersion,

        query: u.query,

        method: req.method,

        host: req.headers.host,

        path: u.path,

        serverIp: '-',

        url: protocol + '://' + req.headers.host + u.path,

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

    let next = function (idx, cRes, bodyLength, resBody, data) {
        record.update(idx, {
            resHeader: util.extend({}, cRes.headers),

            status: cRes.statusCode,

            statusMessage: cRes.statusMessage,

            contentType: cRes.headers && cRes.headers['content-type'],

            // GZip的大小
            bodyLength: bodyLength,

            // 实际内容的大小
            contentLength: cRes.headers['content-length'] || resBody.length,

            resBody: resBody,

            resTime: +new Date()
        })

        res.writeHead(cRes.statusCode, cRes.headers)

        res.write(data)

        res.end()
    }

    if ((config.modifiedResponse || []).some((mr) => {
        if ((req.headers.host + u.path).indexOf(mr.fullUrl) > -1) {
            next(idx, Object.assign({
                statusCode: 200,
                statusMessage: 'OK'
            }, {
                headers: mr.header
            }), '', mr.content, mr.content)
            return true
        }
    })) {
        return
    }

    // local file
    if (nreq && nreq.readStream) {
        let chunks = []

        let cRes = Object.assign({
            statusCode: 200,
            statusMessage: 'OK'
        }, nreq.headers)

        nreq.readStream.on('data', (chunk) => {
            chunks.push(chunk)
        })

        nreq.readStream.on('end', () => {
            let resBody = chunks.toString('utf-8')

            next(idx, cRes, resBody.length, resBody, Buffer.concat(chunks))
        })

        return
    }

    // remote request
    let proxyRequest = function (idx, postData) {
        let pReq = sender.request(options, (pRes) => {
            let chunks = [];

            pRes.on('data', (chunk) => {
                chunks.push(chunk)
            })

            pRes.on('end', () => {
                let resBody = chunks.toString('utf-8')

                let bodyLength = resBody.length

                let data = Buffer.concat(chunks)

                if (/gzip/i.test(pRes.headers['content-encoding'])) {
                    zlib.unzip(data, function (err, buffer) {
                        if (err) {
                            return
                        }

                        resBody = buffer.toString('utf-8')

                        next(idx, pRes, bodyLength, resBody, data)
                    })

                    return
                }

                next(idx, pRes, bodyLength, resBody, data)
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
                reqBody: body.toString('utf-8')
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
