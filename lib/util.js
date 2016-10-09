var os = require('os');

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

var getIpList = function () {
    var ipList = [];
    var ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            if (iface.family == 'IPv4') {
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

var isLocalAddress = function (url) {
    return getIpList().some(function (ip) {
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

    return whiteList.some(function (m) {
        m === method;
    });
};

var getErrorStack = function (err) {
    if (!err) {
        return '';
    }

    var stack;
    try {
        stack = err.stack;
    }
    catch (e) {}

    return stack || err.message || err;
};

var request = function () {

};

module.exports = {
    type: type,
    extend: extend,
    getIpList: getIpList,
    hasProtocol: hasProtocol,
    setProtocol: setProtocol,
    getErrorStack: getErrorStack,
    isLocalAddress: isLocalAddress,
    isContainBodyData: isContainBodyData
};
