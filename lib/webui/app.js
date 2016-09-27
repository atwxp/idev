var path = require('path');
var io = require('socket.io');
var express = require('express');
var httpProxy = require('http-proxy');
var bodyParser = require('body-parser');

var routesAPI = require('./api/index');
var config = require('../config');

var proxy = httpProxy.createProxyServer();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'client'), {maxAge: 300000}));

// routes =====================================
// app.use('/api', routesAPI);

if (config.debug) {
    require('./webpack.dev.config.js')();

    app.use('/', function (req, res) {
        proxy.web(req, res, {
            target: 'http://localhost:8080/'
        });
    });
}
else {
    app.use(function (req, res) {
        res.sendFile(path.join(__dirname, 'output', 'index.html'));
    });
}

proxy.on('error', function (e) {
    console.log('Could not connect to proxy, please try again...');
});

// run webui
app.run = function () {
    var server = app.listen(config.uiport);

    app.io = io.listen(server);

    app.io.sockets.on('connection', function (socket) {

        socket.on('disconnect', function (sk) {

        });
    });
};

exports.app = app;
