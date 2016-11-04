import http from 'http';
// import https from 'https';
import net from 'net';
import url from 'url';
// import zlib from 'zlib';
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
    // init webui
    webui.run();

    // http proxy server
    httpServer = http.createServer((req, res) => {
        // 本地 ip 代理到 webui
        if (util.isLocalAddress(req.headers.host)) {
            proxy.web(req, res, {
                target: 'http://' + config.host + ':' + config.uiport
            });

            return;
        }

        // 获取所有请求通知webui
        notify(req);

        // 转发
        responder.respond(req, res);

        var u = url.parse(req.url);

        var options = {
            hostname: u.hostname,
            port: u.port || 80,
            path: u.pathname,
            method: req.method,
            headers: req.headers
        };

        // parse post/put body
        var body = [];
        if (util.isContainBodyData(req.method)) {
            req.on('data', (chunk) => {
                body.push(chunk);
            });

            req.on('end', () => {
                options.data = Buffer.concat(body);
            });
        }

        var pReq = http.request(options, (pRes) => {
            // var data;
            // var chunks = [];
            // var encoding = pRes.headers['content-encoding'];
            // // 非gzip/deflate要转成utf-8格式
            // if (encoding === 'undefined') {
            //     res.setEncoding('utf-8');
            // }
            // pRes.on('data', function (chunk){
            //     chunks.push(chunk);
            // });
            // pRes.on('end', function () {
            //     var buffer = Buffer.concat(chunks);

            //     if (encoding === 'gzip') {
            //         zlib.gunzip(buffer, function (err, decoded) {
            //             data = decoded && decoded.toString();
            //             // callback(err, pRes.headers, data);
            //             // res.end(data);
            //         });
            //     }
            //     else if (encoding === 'deflate') {
            //         zlib.inflate(buffer, function (err, decoded) {
            //             data = decoded && decoded.toString();
            //             // callback(err, pRes.headers, data);
            //         });
            //     }
            //     else {
            //         data = buffer.toString();
            //         // callback(err, pRes.headers, data);
            //     }
            // });

            // pipe client to server response
            res.writeHead(pRes.statusCode, pRes.headers);
            pRes.pipe(res);
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
