import url from 'url';
import dns from 'dns';

import webui from '../webui/app';

let reqData = [];

/*
 * url,
   method
 * upgrade
 * statusCode
 * statusMessage
 *  httpVersion: '1.1'
 * header: {
    host:
    accept: ''.
    connection:
    'proxy-connection',
    cookie,
    user-agent,
    accept-language,
    referer,
    accept-encoding
 }
 */
function collectReq(req) {
    var obj = url.parse(req.url, true);

    reqData.push({
        url: obj.href,
        status: 200,
        protocol: obj.protocol.slice(0, -1).toUpperCase(),
        method: req.method,
        host: obj.hostname,
        pathname: obj.pathname,
        contentType: 'text/html',
        serverIp: '127.0.0.1',
        headers: req.headers
    });
}

function resolveDNS(name) {
    dns.lookup(name, function (err, address, family) {
        if (err) {
            throw err;
        }
    })
}

// 每隔一段时间才去通知 webui
setInterval(function () {
    webui.client && webui.client.emit('reqArrival', reqData);

    reqData = [];

}, 2000);

export default function (req) {
    collectReq(req);
};
