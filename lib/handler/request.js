import http from 'http'
import https from 'https'
import url from 'url'
import net from 'net'
import zlib from 'zlib'
import tls from 'tls'

import CA from './ca'
import record from  './record'

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

    let proxyRequest = function (postData) {

        let pReq = sender.request(options, (pRes) => {

            let chunks = [];

            let next = function (idx, bodyLength, resBody, data) {
                record.update(idx, {
                    resHeader: util.extend({}, pRes.headers),

                    status: pRes.statusCode,

                    statusMessage: pRes.statusMessage,

                    contentType: pRes.headers && pRes.headers['content-type'],

                    // GZip的长度
                    bodyLength: bodyLength,

                    // 实际内容的长度
                    contentLength: pRes.headers['content-length'] || resBody.length,

                    resBody: resBody,

                    resTime: +new Date()
                })

                res.writeHead(pRes.statusCode, pRes.headers)

                res.write(data)

                res.end()
            }

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

                        next(idx, bodyLength, resBody, data)
                    })

                    return
                }

                next(idx, bodyLength, resBody, data)
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

            proxyRequest(Buffer.concat(body))
        })

        return
    }

    proxyRequest()
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
