import http from 'http'
import https from 'https'
import url from 'url'
import zlib from 'zlib'
import net from 'net'

import record from  './record'

import util from '../util'

function httpRequestHandler(req, res) {
    let u = url.parse(req.url, true)

    let sessionData = {
        url: u.href,

        // now can't get request status(it's in response)
        status: '-',

        // transform to HTTP/S
        protocol: u.protocol && u.protocol.slice(0, -1).toUpperCase(),

        httpVersion: req.httpVersion,

        query: u.query,

        method: req.method,

        host: u.hostname,

        path: u.path,

        serverIp: '-',

        contentLength: -1,

        reqHeader: util.extend({}, req.headers),

        reqTime: +new Date()
    }

    // parse post/put body
    let body = [];
    if (util.isContainBodyData(req.method)) {
        req.on('data', (chunk) => {
            body.push(chunk)
        });

        req.on('end', () => {
            options.data = Buffer.concat(body)

            sessionData.reqBody = options.data
        });
    }

    let idx = record.add(sessionData)

    let options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: req.method,
        headers: req.headers
    }

    let pReq = (/https/i.test(sessionData.protocol) ? https : http).request(options, (pRes) => {
        res.writeHead(pRes.statusCode, pRes.headers);

        let chunks = [];

        let next = function (idx, pRes, bodyLength, resBody) {
            record.update(idx, {
                resHeader: util.extend({}, pRes.headers),

                status: pRes.statusCode,

                statusMessage: pRes.statusMessage,

                contentType: pRes.headers && pRes.headers['content-type'],

                bodyLength: bodyLength,

                contentLength: pRes.headers['content-length'] || resBody.length,

                resBody: resBody,

                resTime: +new Date()
            })
        }

        pRes.on('data', (chunk) => {
            chunks.push(chunk)

            res.write(chunk)
        })

        pRes.on('end', () => {
            res.end()

            let resBody = chunks.toString('utf-8');

            let bodyLength = resBody.length;

            if (/gzip/i.test(pRes.headers['content-encoding'])) {
                zlib.unzip(Buffer.concat(chunks), function (err, buffer) {
                    if (err) {
                        return
                    }

                    resBody = buffer.toString('utf-8')

                    next(idx, pRes, bodyLength, resBody)
                })

                return
            }

            next(idx, pRes, bodyLength, resBody)
        })
    }).on('error', (e) => {
        res.writeHead(404);
        res.end();
    });

    // pipe server to client request
    req.pipe(pReq);
}

function connectReqHandler(req, cltSocket, head) {
    var urlInfo = url.parse(util.setProtocol(req.url))

    var srvSocket = net.connect(urlInfo.port, urlInfo.hostname, function () {
        cltSocket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: idev-Proxy\r\n\r\n')

        srvSocket.write(head)

        srvSocket.pipe(cltSocket)

        cltSocket.pipe(srvSocket)
    })

    srvSocket.on('error', () => {
        console.error('https connect error: ' + req.url)

        cltSocket.end()
    })
}

export default {
    httpRequestHandler,
    connectReqHandler
}
