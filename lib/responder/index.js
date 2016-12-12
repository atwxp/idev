import fs from 'fs'
import url from 'url'
import path from 'path'
import mime from 'mime'
import util from '../util'

// https://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
const URLREG = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.\d]{2,6})(\:\d{1,4})?([\/\w \.-]*)*\/?$/

const IPREG = /^(https?:\/\/)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\:[0-9]{1,4})?/

const FILEPATHREG = /^([a-z]:)?((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+/i

export default function (rule, req, res) {
    if (!rule.checked) {
        return
    }

    let pattern = rule.pattern && rule.pattern.trim()

    if (typeof pattern !== 'string') {
        return
    }

    let u = url.parse(req.url, true)

    let fullUrl = ''
        + ((util.hasProtocol(u.protocol) && u.protocol.slice(0, -1).toLowerCase()) || 'https')
        + '://' + req.headers.host + u.path

    // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    let match = pattern.match(/^\s*regexp\s*:\s*(.*)/)

    pattern = new RegExp(!match ? pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') : match[1].trim())

    if (!pattern.test(fullUrl)) {
        return
    }

    let responder = rule.respond && rule.respond.trim()

    let filepath = rule.filepath && rule.filepath.trim()

    if (typeof responder === 'string') {
        let match = responder.match(/^\s*(html|js|css|json)\s*:\s*(.*)/)

        if (match) {
            let responseCallback = null

            try {
                responseCallback = eval(match[2].trim())
            }

            catch (e) {
                console.error('eval script error!')
                return
            }

            return {
                req,

                options: {
                    responseCallback,

                    url: fullUrl,

                    match: pattern,

                    type: match[1] === 'js' ? 'javascript' : match[1]
                }
            }
        }

        // localfile
        if (
            (filepath && path.isAbsolute(filepath))
            || path.isAbsolute(responder)
        ) {

            filepath = filepath || responder

            let stats = {}

            try {
                stats = fs.statSync(filepath)
            }
            catch (e) {
                console.error('The responder is not a file or dir!')
                return
            }

            if (!stats.isFile()) {
                console.error('The responder is not a file!')
                return
            }

            return {
                readStream: fs.createReadStream(filepath, {encoding: 'utf-8'}),
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
