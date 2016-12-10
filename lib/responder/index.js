import url from 'url'
import path from 'path'
import fs from 'fs'
import mime from 'mime'

import util from '../util'

// https://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
const URLREG = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.\d]{2,6})(\:\d{1,4})?([\/\w \.-]*)*\/?$/

const IPREG = /^(https?:\/\/)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\:[0-9]{1,4})?/

const FILEPATHREG = /^([a-z]:)?((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+/i

export default function (rule, req, res) {
    let pattern = rule.pattern && rule.pattern.trim()

    if (
        typeof pattern !== 'string'
        && util.typeof(pattern) !== 'regexp'
    ) {
        // throw new Error('pattern should be string or RegExp')
        return
    }

    let u = url.parse(req.url, true)

    let fullUrl = ''
        + ((util.hasProtocol(u.protocol) && u.protocol.slice(0, -1).toLowerCase()) || 'https')
        + '://' + req.headers.host + u.path

    // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    pattern = typeof pattern === 'string'
        ? new RegExp(pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))
        : pattern

    if (!pattern.test(fullUrl)) {
        return
    }

    let responder = rule.respond && rule.respond.trim()

    let filepath = rule.filepath && rule.filepath.trim()

    if (typeof responder === 'string') {
        // localfile
        // if (filepath || FILEPATHREG.test(responder)) {
        if (
            (filepath && path.isAbsolute(filepath))
            || path.isAbsolute(responder)
        ) {

            filepath = filepath || responder

            // todo:
            // if (filepath not exsits) {
            //     console.log('filepath not exists')
            //     return
            // }

            let stats = fs.statSync(filepath)

            if (!stats.isFile()) {
                console.log('The Responder is not a file')
                return
            }

            return {
                readStream: fs.createReadStream(filepath),
                headers: {
                    headers: {
                        'content-length': stats.size,
                        'content-type': mime.lookup(filepath),
                        'server': 'idev',
                        'content-encoding': 'utf-8'
                    }
                }
            }
        }

        if (IPREG.test(responder) || URLREG.test(responder)) {
            // pattern is url or path or sth...(now is simple url mathed URLREG)
            fullUrl = fullUrl.replace(pattern, (match) => {
                return match.slice(-1) === '/'
                    ? (responder.slice(-1) === '/' ?  responder : responder + '/')
                    : (responder.slice(-1) === '/' ? responder.slice(0, -1) : responder)
            })

            fullUrl = fullUrl.replace(/^https?\:\/\//, () => {
                return ''
            })

            if (!/^https?\:\/\//.test(fullUrl)) {
                fullUrl = 'http://' + fullUrl
            }

            req.url = fullUrl

            req.headers.host = url.parse(req.url).host

            return {
                req
            }
        }
    }
}
