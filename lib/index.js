import http from 'http';
// import https from 'https';
import net from 'net';
import url from 'url';
import zlib from 'zlib';
import httpProxy from 'http-proxy';

import util from './util';
import config from './config';

import webui from './webui/app';

import responder from './responder';

import notify from  './handler/notify';

let idev = {};
let httpServer;
const proxy = httpProxy.createProxyServer();

var showStartInfo = function () {
    console.log(config.name + ' started...');

    console.log('configure you device to the following url: ');

    util.getIpList().forEach((ip) => {
        console.log('    http://' + ip + ':' + config.port + '/');
    });

    console.log('press [Ctrl + C] to stop...');
};

idev.start = function () {
    let id = 0;

    // init webui
    webui.run();

    // http proxy server
    httpServer = http.createServer((req, res) => {
        // 本地 ip 代理到 webui
        if (util.isLocalAddress(req.headers.host)) {
            proxy.web(req, res, {
                target: 'http://' + config.host + ':' + config.uiport
            });

            id = 0;

            return;
        }

        id++;

        let notifyResCallback = (function (id) {
            return function (res) {
                notify.collectRes(id, res);
            }
        })(id);

        // 获取所有请求通知webui
        notify.collectReq(id, req);

        // 转发
        responder.respond(req, res);

        let u = url.parse(req.url);

        let options = {
            hostname: u.hostname,
            port: u.port || 80,
            path: u.path,
            method: req.method,
            headers: req.headers
        };

        // parse post/put body
        let body = [];
        if (util.isContainBodyData(req.method)) {
            req.on('data', (chunk) => {
                body.push(chunk);
            });

            req.on('end', () => {
                options.data = Buffer.concat(body);
            });
        }

        let pReq = http.request(options, (pRes) => {
            res.writeHead(pRes.statusCode, pRes.headers);

            let chunks = [];
            pRes.on('data', (chunk) => {
                chunks.push(chunk);
                res.write(chunk);
            });
            pRes.on('end', () => {
                let b = Buffer.concat(chunks);

                let next = function (err, decodeText) {
                    if (err) {
                        return;
                    }

                    // 获取所有请求的响应通知 webui
                    notifyResCallback(util.extend({}, pRes, {
                        'textview': decodeText || (/^image\//i.test(pRes.headers['content-type']) ? '' : chunks.toString('utf-8')),

                        'content-length': decodeText && decodeText.length
                    }));
                }

                switch (pRes.headers['content-encoding']) {
                    case 'gzip':
                    case 'deflate':
                        zlib.unzip(b, function (err, buffer) {

                            if (err) {
                                return;
                            }

                            next(null, buffer.toString());
                        })
                        break;

                    default:
                        next(null);
                }

                res.end();
            });

        }).on('error', (e) => {
            res.writeHead(404);
            res.end();
        });

        // pipe server to client request
        req.pipe(pReq);
    });

    // httpServer.setMaxListeners(0);
    httpServer.listen(config.port);

    // https proxy server
    // httpsServer = https.createServer({
    //     key: ''
    //     cert: ''
    // }, function (req, res) {
    //     req.type = 'https';
    // });

    httpServer.on('connect', (req, cltSocket, head) => {
        var urlInfo = url.parse(util.setProtocol(req.url));

        var srvSocket = net.connect(urlInfo.port, urlInfo.hostname, function () {
            cltSocket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: idev-Proxy\r\n\r\n');

            srvSocket.write(head);
            srvSocket.pipe(cltSocket);
            cltSocket.pipe(srvSocket);
        });

        srvSocket.on('error', () => {
            console.error('https connect error: ' + req.url);
            cltSocket.end();
        });
    });

    // websocket

    // http client connection error close socket
    httpServer.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    showStartInfo();
};

idev.stop = function () {
    httpServer && httpServer.close();
};

process.on('uncaughtException', (err) => {
    console.error('uncaughtException: ' + util.getErrorStack(err));
    process.exit(1);
});

export default idev;
