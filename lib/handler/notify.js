import url from 'url'
import dns from 'dns'

import util from '../util'
import webui from '../webui/app'

let sessions = {};

/**
 * collect request params
 *
 * @param {number} index, request id
 * @param {Object} res,   request
 * url,
 * method
 * upgrade
 * statusCode
 * statusMessage
 * httpVersion: '1.1'
 * headers: {
    host,
    accept,
    connection,
    proxy-connection,
    cookie,
    user-agent,
    accept-language,
    referer,
    accept-encoding
 }
 */
function collectReq(index, req) {
    var obj = url.parse(req.url, true);

    sessions[index] = {
        id: index,

        type: 'req',

        url: obj.href,

        // now can't get request status(it's in response)
        status: '-',

        // transform to HTTP
        protocol: obj.protocol.slice(0, -1).toUpperCase(),

        httpVersion: req.httpVersion,

        // request methods
        method: req.method,

        host: obj.hostname,

        pathname: obj.path,

        // now can't get request contentType(it's in response)
        contentType: '',

        serverIp: '',

        // reqHeaders: req.headers,

        reqTime: +new Date()
    };
}

/**
 * collect response params
 *
 * @param {number} index, response id
 * @param {Object} res,   response
 */
function collectRes(index, res, req) {
    var data = {};

    data[index] = {
        id: index,

        type: 'res',

        status: res.statusCode,

        resTime: +new Date(),

        body: res.headers['content-length'],

        contentType: res.headers['content-type'],

        cache: res.headers['cache-control'],

        lastModified: res.headers['last-modified'],

        contentEncoding: res.headers['content-encoding'],

        server: res.headers['server'],

        vary: res.headers['vary'],

        expires: res.headers['expires'],

        date: res.headers['date'],

        connection: res.headers['connection'],

        cls: getCls(res.statusCode, res.headers['content-type'])

        // resHeaders: res.headers
    };

    util.extend(sessions, data)
}

/**
 * resolve dns
 *
 * @param {string} name, dns name
 */
function resolveDNS(name) {
    dns.lookup(name, function (err, address, family) {
        if (err) {
            throw err;
        }
    })
}

function getCls(statusCode, contentType) {
    let pattern = {
        html: /html/i,

        css: /css/i,

        js: /javascript/i,

        image: /image/i
    };

    let code = {
        error: /(4\d{2})|(5\d{2})/,
        blur: /(3\d{2})/
    }

    statusCode = '' + statusCode;
    contentType = '' + contentType;

    let keys = Object.keys(code);
    for (let i = 0, l = keys.length; i < l; i++) {
        if (code[keys[i]].test(statusCode)) {
            return keys[i];
        }
    }

    keys = Object.keys(pattern);
    for (let i = 0, l = keys.length; i < l; i++) {
        if (pattern[keys[i]].test(contentType)) {
            return keys[i];
        }
    }

    return '';
}

// 每隔一段时间才去通知 webui
setInterval(function () {
    webui.client && webui.client.emit('reqArrival', sessions);

    sessions = {};

}, 2000);

export default {
    collectReq,
    collectRes
}
