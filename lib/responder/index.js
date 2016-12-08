import url from 'url'

import util from '../util'

import fileProxy from './file-proxy'
import remoteProxy from './remote-proxy'

// https://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
const URLREG = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

const IPREG = /^(https?:\/\/)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\:[0-9]{1,4})?/

export default function (rule, req, res) {
    let pattern = rule.pattern

    let responder = rule.respond

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

    pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    if (!pattern.test(fullUrl)) {
        return
    }

    if (typeof responder === 'string') {
        // pattern is url or path or sth...(now is simple url mathed URLREG)

        if (IPREG.test(responder) || URLREG.test(responder)) {

            fullUrl = fullUrl.replace(pattern, (match) => {
                return responder += match.slice(-1) === '/'
                    ? (responder.slice(-1) === '/' ?  '' : '/')
                    : (responder.slice(-1) === '/' ? responder.slice(0, -1) : '')
            })

            fullUrl = fullUrl.replace(/^https?\:\/\//, () => {
                return ''
            })

            if (!/^https?\:\/\//.test(fullUrl)) {
                fullUrl = 'http://' + fullUrl
            }

            req.url = fullUrl

            req.headers.host = url.parse(req.url).host
            return req
        }

        // localfile path
        else {
            // fileProxy()
        }
    }
}
