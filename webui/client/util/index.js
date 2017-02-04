/**
 * @file   util tool
 * @author wxp201013@163.com
 */

import {base64 as Base64} from './base64'

let zIndex = 99

export function noop() {}

export function type(o) {
    return Object.prototype.toString.call(o).toLowerCase().slice(8, -1)
}

export function gid() {
    return 'xxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16))
}

export function clone(obj) {
    let ret = {}

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                ret[key] = clone(obj[key])
            }
            else {
                ret[key] = obj[key]
            }
        }
    }

    return ret
}

export function extend(target, source, deepClone = false, alone = false) {
    target = alone ? clone(target) : target

    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            if (deepClone && type(target[key]) === 'object' && type(source[key]) === 'object') {
                extend(target[key], source[key], deepClone)
            }
            else {
                target[key] = source[key]
            }
        }
    }

    return target
}

/* eslint-disable */
export function trim(str) {
    return str.replace(/^(\s|\u00A0|　)+|(\s|\u00A0|　)+$/g, '')
}
/* eslint-enable */

export function capitalize(str, lower) {
    return (lower ? str[0].toLowerCase() : str[0].toUpperCase()) + str.slice(1)
}

/**
 * transform camelCase
 *
 * @param {string} str, string to be camelcased
 * @param {string} modifier, string modifier
 * @param {string} joiner,   string joiner
 * @param {boolean} firstLower, wheather first letter is lower
 * @param {boolean} allLower, wheather all letters are lower
 *
 * @return {string}
 *
 * util.camelCase(v), 'auto-response' => 'AutoResponse'
 * util.camelCase(v, '-', '', true), 'content-type' => 'contentType'
 * util.camelCase(v, '-', '-', true), 'content-type' => 'content-Type'
 * util.camelCase(v, '-', '-', false, true), 'Auto-Response' => 'auto-response'
 */
export function camelCase(str, modifier = '-', joiner = '', firstLower = false, allLower = false) {

    let arr = str.split(modifier)

    arr = arr.map((i, idex) => capitalize(i, firstLower && idex === 0 || allLower))

    return arr.join(joiner)
}

export function toLen(val, len, end) {
    if (!len) {
        return val
    }

    let padding = new Array(len + 1).join('0')

    if (end) {
        return (padding + val).slice(-len)
    }

    return (padding + val).slice(0, len)
}

export function toHex(uni) {
    return uni.toString(16).toUpperCase()
}

export function uni2hex(str, pos) {

    let c = str.charCodeAt(pos || 0)

    let hex = toLen(toHex(c), 4, true)

    return '\\u' + hex
}

export function num2Hex(num) {
    return parseInt('' + num, 16)
}

export function unicodeEncode(str) {
    let ret = []

    for (let i = 0, len = str.length; i < len; i++) {
        ret.push(uni2hex(str, i))
    }

    return ret.join('')
}

export function unicodeDecode(str) {

    return str.replace(/(\\u[a-zA-Z0-9]+)+/g, m => {
        let hex = m.split('\\u')

        return String.fromCharCode.apply(null, hex.map(v => num2Hex(v)))
    })
}

export function base64Encode(str) {
    return Base64.encode(str, true)
}

export function base64Decode(str) {
    return Base64.decode(str, true)
}

export function utf8Encode(str) {
    return str
        .replace(
            /[\u0080-\u07ff]/g,
            function (c) {
                let cc = c.charCodeAt(0)

                return ['', toHex(0xc0 | cc >> 6), toHex(0x80 | cc & 0x3f)].join('%')

            }
        )
        .replace(
            /[\u0800-\uffff]/g,
            function (c) {
                let cc = c.charCodeAt(0)

                return ['', toHex(0xe0 | cc >> 12), toHex(0x80 | cc >> 6 & 0x3F), toHex(0x80 | cc & 0x3f)].join('%')
            }
        )
}

export function utf8Decode(str) {
    return str.replace(/(%[a-zA-Z0-9]+)+/g, m => {
        let d = m.split('%')

        let ret = ''

        for (let i = 0, len = d.length; i < len; i++) {
            let c1 = num2Hex(d[i])

            let c2

            if (isNaN(c1)) {
                continue
            }

            // 0000 0000 (0)
            // 0111 1111 (127)
            if (c1 < 128) {
                ret += String.fromCharCode(c1)
                i++
            }
            // 1100 0000 (192)
            // 1101 1111 (223)
            else if (c1 > 191 && c1 < 224) {
                c2 =  num2Hex(d[++i])
                ret += String.fromCharCode((c1 & 0x1f) << 6 | (c2 & 0x3f))
            }

            else {
                c2 = num2Hex(d[++i])

                let c3 = num2Hex(d[++i])

                ret += String.fromCharCode((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | (c3 & 0x3f))
            }
        }

        return ret
    })
}

export function getZIndex(z) {
    return z ? ++z : ++zIndex
}

export function getStyle(elem, attr) {
    return window.getComputedStyle(elem, null)[attr]
}

export function getContentType(contentType) {
    let pattern = {
        javascript: /javascript/i,

        css: /css/i,

        image: /^image\//i,

        html: /html/i,

        json: /json/i
    }

    let type = Object.keys(pattern).filter(p => pattern[p].test(contentType))

    return type && type[0]
}

export function getStatusType(statusCode) {
    let statusCodePattern = {
        error: /(4\d{2})|(5\d{2})/,
        blur: /(3\d{2})/
    }

    let type = Object.keys(statusCodePattern).filter(p => statusCodePattern[p].test(statusCode))

    return type && type[0]
}

export function createNode(str, outHtml, cls) {
    if (!str) {
        return str
    }

    let div = document.createElement(outHtml || 'div')

    cls && div.classList.add(cls)

    typeof str === 'string'
        ? (div.innerHTML = str)
        : div.appendChild(str)

    return outHtml ? div : div.firstChild
}

export function formatSize(size) {
    let unit = {
        K: 1024,

        M: 1024 * 1024,

        G: 1024 * 1024 * 1024
    }

    let keys = Object.keys(unit)

    for (let i = 0, l = keys.length; i < l; i++) {
        let v = unit[keys[i]]

        if (size % v < 1024) {
            return size / v + keys[i]
        }
    }
}

export function decodeUri(str) {
    return decodeURIComponent(str)
}

export function encodeUri(str) {
    return encodeURIComponent(str)
}
