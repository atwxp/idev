import http from 'http'
import https from 'https'
import httpProxy from 'http-proxy'

import util from './util'
import config from './config'

import requestHandler from './handler/request'
import record from './handler/record'

import webui from '../webui/app'

let idev = {}

let httpServer

let httpsServer

const proxy = httpProxy.createProxyServer()

var logStartInfo = function () {
    console.log(config.name + ' started...')

    console.log('configure you device to the following url: ')

    util.getIpList().forEach((ip) => {
        console.log('    http://' + ip + ':' + config.port + '/')
    })

    console.log('press [Ctrl + C] to stop...')
}

idev.start = function () {
    // init webui
    webui.run();

    // http proxy server
    httpServer = http.createServer((req, res) => {

        // http://ip:8888 代理到 webui(http://ip:8889)
        if (util.isLocalAddress(req.headers.host)) {
            if (req.headers.host.indexOf(config.port) > -1) {
                record.setIndex(0)

                proxy.web(req, res, {
                    target: 'http://' + config.host + ':' + config.uiport
                })
            }

            // download rootCA
            if (
                req.headers.host.indexOf(config.uiport) > -1
                && /cgi\/rootCA/.test(req.url)
            ) {
                proxy.web(req, res, {
                    target: req.url
                })
            }

            return
        }

        requestHandler.httpRequestHandler(req, res)
    })

    httpServer.listen(config.port)

    // CONNECT request for https over http
    httpServer.on('connect', requestHandler.connectReqHandler)

    // todo: websocket

    // http client connection error close socket
    httpServer.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    })

    logStartInfo()
}

idev.stop = function () {
    httpServer && httpServer.close()
}

process.on('SIGINT', () => {
    process.exit()
})

process.on('uncaughtException', (err) => {
    console.error('uncaughtException: ' + util.getErrorStack(err))

    process.exit()
})

export default idev
