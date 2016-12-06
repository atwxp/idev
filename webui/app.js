import os from 'os'
import fs from 'fs'
import path from 'path'
import io from 'socket.io'
import express from 'express'
import httpProxy from 'http-proxy'
import bodyParser from 'body-parser'

import routesAPI from './api/index'
import webpackDevConfig from './webpack.dev.config.babel'

import util from '../lib/util'
import config from '../lib/config'

let app = express();
const proxy = httpProxy.createProxyServer();

const CERT_DIR = path.join(util.getHomeDir(), '.IdevData', 'certs')
const ROOT_CRT_PATH = path.join(CERT_DIR, 'rootCA.crt')

// run webui
app.run = function () {
    // view engine =====================================
    app.set('view engine', 'html');

    // Middleware config =====================================
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static(path.join(__dirname, 'output')));

    // routes =====================================
    // app.use('/api', routesAPI);

    // We only want to run the workflow when in dev
    app.use('/cgi/rootCA', (req, res) => {
        res.sendFile(ROOT_CRT_PATH)
    });

    if (config.debug) {
        webpackDevConfig();

        app.use('/', (req, res) => {
            proxy.web(req, res, {
                target: 'http://localhost:' + config.webpackPort + '/'
            });
        });
    }
    else {
        app.use((req, res) => {
            res.sendFile(path.join(__dirname, 'output', 'index.html'));
        });
    }

    const server = app.listen(config.uiport);

    app.io = io.listen(server);
    // 服务器监听所有客户端，并返回该新连接对象
    app.io.sockets.on('connection', (client) => {
        app.client = client;

        // a new client join in 获取 IP 端口 hostname网络信息
        client.emit('join', {
            hostname: os.hostname(),
            port: config.port,
            ipv4: util.getIpList()
        })

        client.on('interceptHttps', (val) => {
            config.interceptHttps = val
        })

        // webui close
        client.on('disconnect', () => {
            console.log('client disconnect, ooops!');
        })

        // webui error
        client.on('error', (err) => {
            console.log('An error occurred!', err);
        })
    })

    console.log('webui server started on port ' + config.uiport);

    // error handlers =====================================
    proxy.on('error', (e) => {
        console.log('Could not connect to proxy, please try again...');
    });

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // production error handler no stacktraces leaked to user
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
};

export default app
