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
        protocol: obj.protocol && obj.protocol.slice(0, -1).toUpperCase(),

        httpVersion: req.httpVersion,

        query: obj.query,

        // request methods
        method: req.method,

        host: obj.hostname,

        path: obj.path,

        // now can't get request contentType(it's in response)
        contentType: '',

        serverIp: '',

        contentLength: -1,

        reqHeaders: util.extend({}, req.headers),

        reqTime: +new Date()
    };
}

/**
 * collect response params
 *
 * @param {number} index, response id
 * @param {Object} res,   response
 */
function collectRes(index, res) {
    var data = {};

    data[index] = {
        id: index,

        type: 'res',

        status: res.statusCode,

        statusMessage: res.statusMessage,

        resHeaders: util.extend({}, res.headers),

        textview: res.textview,

        contentLength: res.headers['content-length'] || res['content-length'],

        cls: getCls(res.statusCode, res.headers['content-type']),

        resTime: +new Date()
    };

    util.extend(sessions, data);
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

// todo: 优化
function getCls(statusCode, contentType) {
    let pattern = {
        html: /html/i,

        css: /css/i,

        js: /javascript/i,

        image: /^image\//i
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
    // empty {}
    if (!Object.keys(sessions).length) {
        return;
    }

    webui.client && webui.client.emit('reqArrival', sessions);

    sessions = {};

}, 2000);

export default {
    collectReq,
    collectRes
}