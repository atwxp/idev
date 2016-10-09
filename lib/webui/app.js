import path from 'path';
import io from 'socket.io';
import express from 'express';
import httpProxy from 'http-proxy';
import bodyParser from 'body-parser';

import config from '../config';
import routesAPI from './api/index';
import webpackDevConfig from './webpack.dev.config.babel';

const app = express();
const proxy = httpProxy.createProxyServer();

const isDev = !!config.debug;

// view engine =====================================
app.set('view engine', 'html');

// Middleware config =====================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'client'), {maxAge: 300000}));

// routes =====================================
// app.use('/api', routesAPI);

// We only want to run the workflow when in dev
if (isDev) {
    webpackDevConfig();

    app.use('/', (req, res) => {
        proxy.web(req, res, {
            target: 'http://localhost:8080/'
        });
    });
}
else {
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, 'output', 'index.html'));
    });
}

// run webui
app.run = function () {
    var server = app.listen(config.uiport);

    app.io = io.listen(server);

    app.io.sockets.on('connection', (socket) => {

        socket.on('disconnect', (sk) => {

        });
    });

    console.log('webui server started on port ' + config.uiport);
};

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

export default app;
