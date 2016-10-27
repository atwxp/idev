import os from 'os';

var type = function (o) {
    return Object.prototype.toString.call(o).toLowerCase().slice(8, -1);
};

var extend = function (target) {
    var len = arguments.length;

    if (len < 2 || target == null) {
        return target;
    }

    for (var i = 1; i < len; i += 1) {
        var s = arguments[i];
        var k = Object.keys(s);

        for (var j = 0, l = k.length; j < l; j += 1) {
            var key = k[j];

            target[key] = s[key];
        }
    }

    return target;
};

/**
 * get local ipv4/v6 address
 *
 * @return {Array}
 */
var getIpList = function (family) {
    family = family || 'IPv4';

    var ipList = [];
    var ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach((ifname) => {
        ifaces[ifname].forEach((iface) => {
            if (iface.family === family) {
                ipList.push(iface.address);
            }
        });
    });

    return ipList;
};

/**
 * wheather the url has protocol (http://, https://, ftp://....)
 *
 * @param {string} url, request url
 *
 * @return {boolean}
 */
var hasProtocol = function (url) {
    return /^[a-z0-9]+:\/\//i.test(url);
};

/**
 * padding the url's protocol (http://, https://, ftp://....)
 *
 * @param {string} url, request url
 * @param {boolean} isHttps, https protocol
 *
 * @return {string}
 */
var setProtocol = function (url, isHttps) {
    return hasProtocol(url) ? url
        : (isHttps ? 'https://' : 'http://') + url;
};


/**
 * wheather is local url
 *
 * @param {string} url, request url
 *
 * @return {boolean}
 */
var isLocalAddress = function (url) {
    return getIpList().some((ip) => {
        return url.indexOf(ip) > -1;
    });
};

/**
 * wheather the HTTP request contain body data
 *
 * @param {string} HTTP method token
 *
 * @return {boolean}
 */
var isContainBodyData = function (method) {
    var whiteList = ['POST', 'PUT'];

    return whiteList.some((m) => {
        m === method;
    });
};

/**
 * print error stack
 *
 * @param {Object} err
 *
 * @return {string} err info
 */
var getErrorStack = function (err) {
    if (!err) {
        return '';
    }

    var stack;

    try {
        stack = err.stack;
    }
    catch (e) {

    }

    return stack || err.message || err;
};

var request = function () {

};

export default {
    type,
    extend,
    getIpList,
    hasProtocol,
    setProtocol,
    getErrorStack,
    isLocalAddress,
    isContainBodyData
};
