/**
 * @file   inject vorlon
 * @author wxp201013@163.com
 */

// import cp from 'child_process'

// import config from '../config'
import * as util from '../util'

export function injectScriptToHTML() {
    let ip = util.getIpList().filter(ip => ip !== '127.0.0.1')

    let script = '<script src="https://' + ip[0] + ':1337/vorlon.js"></script>'

    return 'html:(function (data) {var html = data.toString();'
        + 'html = html.replace(/<head>|<head\s[^<]*>/gi, function (match) {return match + \'' + script + '\';});'
        + 'html = html.replace(/Content-Security-Policy/ig, function (match) {return "hacky";});'
        + 'return html;})'
}
