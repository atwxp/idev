/**
 * @file   util tool
 * @author wxp201013@163.com
 */

import Base64 from './base64';

let zIndex = 99;

function noop() {}

function type(o) {
    return Object.prototype.toString.call(o).toLowerCase().slice(8, -1);
}

function gid() {
    return 'xxxxxx'.replace(/x/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
}

function clone(obj) {
    let ret = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                ret[key] = clone(obj[key]);
            }
            else {
                ret[key] = obj[key];
            }
        }
    }

    return ret;
}

function extend(target, source, deepClone = false, alone = false) {
    target = alone ? clone(target) : target;

    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            if (deepClone && type(target[key]) === 'object' && type(source[key]) === 'object') {
                extend(target[key], source[key], deepClone);
            }
            else {
                target[key] = source[key];
            }
        }
    }

    return target;
}

/* eslint-disable */
function trim(str) {
    return str.replace(/^(\s|\u00A0|　)+|(\s|\u00A0|　)+$/g, '');
}
/* eslint-enable */

function capitalize(str, lower) {
    return (lower ? str[0].toLowerCase() : str[0].toUpperCase()) + str.slice(1);
}

/**
 * transform camelCase
 *
 * util.camelCase(v), 'auto-response' => 'AutoResponse'
 * util.camelCase(v, '-', '', true), 'content-type' => 'contentType'
 * util.camelCase(v, '-', '-', true), 'content-type' => 'content-Type'
 * util.camelCase(v, '-', '-', false, true), 'Auto-Response' => 'auto-response'
 */
function camelCase(str, modifier = '-', joiner = '', firstLower = false, allLower = false) {

    let arr = str.split(modifier)

    arr = arr.map((i, idex) => {
        return capitalize(i, firstLower && idex === 0 || allLower)
    })

    return arr.join(joiner)
}

function toLen(val, len, end) {
    if (!len) {
        return str
    }

    let padding = new Array(len + 1).join('0')

    if (end) {
        return (padding + val).slice(-len)
    }
    else {
        return (padding + val).slice(0, len)
    }
};

function toHex(uni) {
    return uni.toString(16).toUpperCase()
}

function uni2hex(str, pos) {

    let c = str.charCodeAt(pos || 0)

    let hex = toLen(toHex(c), 4, true)

    return '\\u' + hex
}

function num2Hex(num) {
    return parseInt('' + num, 16);
}

function unicodeEncode(str) {
    let ret = [];

    for (let i = 0, len = str.length; i < len; i++) {
        ret.push(uni2hex(str, i));
    }

    return ret.join('');
}

function unicodeDecode(str) {

    return str.replace(/(\\u[a-zA-Z0-9]+)+/g, (m) => {
        let hex = m.split('\\u');

        return String.fromCharCode.apply(null, hex.map((v) => {
            return num2Hex(v);
        }));
    })
}

function base64Encode(str) {
    return Base64.encode(str, true);
}

function base64Decode (str) {
    return Base64.decode(str, true);
}

function utf8Encode(str) {
    return str
        .replace(
            /[\u0080-\u07ff]/g,
            function (c) {
                let cc = c.charCodeAt(0);

                return ['', toHex(0xc0 | cc >> 6), toHex(0x80 | cc & 0x3f)].join('%');

            }
        )
        .replace(
            /[\u0800-\uffff]/g,
            function (c) {
                let cc = c.charCodeAt(0);
                return ['', toHex(0xe0 | cc >> 12), toHex(0x80 | cc >> 6 & 0x3F), toHex(0x80 | cc & 0x3f)].join('%');
            }
        );
}

function utf8Decode(str) {
    return str.replace(/(%[a-zA-Z0-9]+)+/g, (m) => {
        var d = m.split('%');

        var ret = '';

        for (let i = 0, len = d.length; i < len; i++) {
            let c1 = num2Hex(d[i]);

            if (isNaN(c1)) {
                continue;
            }

            // 0000 0000 (0)
            // 0111 1111 (127)
            if (c1 < 128) {
                ret += String.fromCharCode(c1);
                i++;
            }
            // 1100 0000 (192)
            // 1101 1111 (223)
            else if (c1 > 191 && c1 < 224) {
                let c2 =  num2Hex(d[++i]);
                ret += String.fromCharCode((c1 & 0x1f) << 6 | (c2 & 0x3f));
            }

            else {
                c2 = num2Hex(d[++i]);

                let c3 = num2Hex(d[++i]);

                ret += String.fromCharCode((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | (c3 & 0x3f));
            }
        }

        return ret;
    });
}

function getZIndex(z) {
    return z ? ++z : ++zIndex;
}

function getStyle(elem, attr) {
    return window.getComputedStyle(elem, null)[attr]
}

function getContentType(contentType) {
    let pattern = {
        javascript: /javascript/i,

        css: /css/i,

        image: /^image\//i,

        html: /html/i,

        json: /json/i
    };

    let type = Object.keys(pattern).filter((p) => {
        return pattern[p].test(contentType)
    })

    return type && type[0]
}

function getStatusType(statusCode) {
    let statusCodePattern = {
        error: /(4\d{2})|(5\d{2})/,
        blur: /(3\d{2})/
    }

    let type = Object.keys(statusCodePattern).filter((p) => {
        return statusCodePattern[p].test(statusCode)
    })

    return type && type[0]
}

function createNode(str, outHtml, cls) {
    if (!str) {
        return str;
    }

    let div = document.createElement(outHtml || 'div');

    cls && div.classList.add(cls);

    typeof str === 'string'
        ? (div.innerHTML = str)
        : div.appendChild(str)

    return outHtml ? div : div.firstChild;
}

function formatSize(size) {
    let unit = {
        'K': 1024,

        'M': 1024 * 1024,

        'G': 1024 * 1024 * 1024,
    }

    let keys = Object.keys(unit)

    for (let i = 0, l = keys.length; i < l; i++) {
        let v = unit[keys[i]]

        if (size % v < 1024) {
            return size / v + keys[i]
        }
    }
}

export default {
    gid,
    type,
    noop,
    trim,
    clone,
    toLen,
    extend,
    getStyle,
    camelCase,
    capitalize,
    createNode,
    formatSize,
    getStatusType,
    getContentType,
    unicodeEncode,
    unicodeDecode,
    base64Encode,
    base64Decode,
    utf8Encode,
    utf8Decode,
    getZIndex
}
