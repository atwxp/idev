/**
 * @file   proxy util file
 * @author wxp201013@163.com
 */

import os from 'os'

export const type = function (o) {
    return Object.prototype.toString.call(o).toLowerCase().slice(8, -1)
}

export const extend = function (target, ...source) {
    let len = source.length

    if (len < 1 || !target) {
        return target
    }

    for (let i = 0; i < len; i += 1) {
        let s = source[i]

        let k = Object.keys(s)

        for (let j = 0, l = k.length; j < l; j += 1) {
            let key = k[j]

            if (type(target[key]) === 'object' && type(s[key]) === 'object') {
                extend(target[key], s[key])
            }
            else {
                target[key] = s[key]
            }
        }
    }

    return target
}

/**
 * get local ipv4/v6 address
 *
 * @param {string} family ipv4/ipv6
 *
 * @return {Array}
 */
export const getIpList = function (family = 'IPv4') {
    let ipList = []

    const ifaces = os.networkInterfaces()

    Object.keys(ifaces).forEach(ifname => {
        ifaces[ifname].forEach(iface => {
            if (iface.family === family) {
                ipList.push(iface.address)
            }
        })
    })

    return ipList
}

/**
 * wheather the url has protocol (http:, http://, https://, ftp://....)
 *
 * @param {string} url, request url
 *
 * @return {boolean}
 */
export const hasProtocol = function (url) {
    return /^[a-z0-9]+:\/?\/?/i.test(url)
}

/**
 * wheather is local url
 *
 * @param {string} url, request url
 * @param {number} port, url port
 * @param {string} path, url path
 * @param {boolean} end, wheather is end
 *
 * @return {boolean}
 */
export const equalLocalAddress = function (url, port = 8888, path = '', end = true) {
    return getIpList().some(ip => {

        ip = '^(https?://)?' + ip + ':' + port
            + (path ? (path.slice(-1) === '/' ? path + '?' : '/?') : '/?')
            + (end ? '$' : '')

        ip = new RegExp(ip)

        return ip.test(url)
    })
}

/**
 * wheather the HTTP request contain body data
 *
 * @param {string} method, HTTP method token
 *
 * @return {boolean}
 */
export const isContainBodyData = function (method) {
    return ['POST', 'PUT'].some(m => m === method)
}

/**
 * print error stack
 *
 * @param {Object} err, err info
 *
 * @return {string}
 */
export const getErrorStack = function (err) {
    if (!err) {
        return ''
    }

    let stack

    try {
        stack = err.stack
    }
    catch (e) {

    }

    return stack || err.message || err
}

export const getHomeDir = function () {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
}
