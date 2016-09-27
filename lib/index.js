var http = require('http');
// var http = require('https');
var net = require('net');
var url = require('url');
var zlib = require('zlib');
var httpProxy = require('http-proxy');

var util = require('./util');
var config = require('./config');
var handlers = require('./handlers');

var idev = module.exports = {};

var httpServer;
var webui = require(config.uipath);
var proxy = httpProxy.createProxyServer();

var showStartInfo = function () {
    console.log(config.name + ' started...');

    console.log('configure you device to the following url: ');

    util.getIpList().forEach(function (ip) {
        console.log('    http://' + ip + ':' + config.port + '/');
    });

    console.log('press [Ctrl + C] to stop...');
};

idev.start = function () {
    // init webui
    webui.app.run();

    // http proxy server
    httpServer = http.createServer(function (req, res) {

        // 本地 ip 代理到 webui
        if (util.isLocalAddress(req.headers.host)) {
            proxy.web(req, res, {
                target: 'http://' + config.host + ':' + config.uiport
            });

            return;
        }

        // 转发
        handlers.respond(req, res);

        var u = url.parse(req.url);

        var options = {
            hostname: u.hostname,
            port: u.port || 80,
            path: u.path,
            method: req.method,
            headers: req.headers
        };

        // parse post body
        var body = [];
        if (util.isContainBodyData(req.method)) {
            req.on('data', function (chunk) {
                body.push(chunk);
            });

            req.on('end', function () {
                options.data = Buffer.concat(body);
            });
        }

        var pReq = http.request(options, function (pRes) {
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

            res.writeHead(pRes.statusCode, pRes.headers);
            pRes.pipe(res);
        }).on('error', function (e) {
            res.writeHead(404);
            res.end();
        });
        req.pipe(pReq);
    });

    // httpServer.setMaxListeners(0);
    httpServer.listen(config.port);
    httpServer.on('clientError', function (err, socket) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    // https proxy server
    // httpsServer = https.createServer({
    //     key: ''
    //     cert: ''
    // }, function (req, res) {
    //     req.type = 'https';
    // });

    httpServer.on('connect', function (req, cltSocket, head) {
        var urlInfo = url.parse(util.setProtocol(req.url));

        var srvSocket = net.connect(urlInfo.port, urlInfo.hostname, function () {
            cltSocket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: idev-Proxy\r\n\r\n');

            srvSocket.write(head);
            srvSocket.pipe(cltSocket);
            cltSocket.pipe(srvSocket);
        });

        srvSocket.on('error', function () {
            console.error('https connect error: ' + req.url);
            cltSocket.end();
        });
    });

    showStartInfo();
};

idev.stop = function () {
    server && server.close();
};

process.on('uncaughtException', function (err) {
    console.error('uncaughtException: ' + util.getErrorStack(err));
    process.exit(1);
});

idev.start();
