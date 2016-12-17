import cp from 'child_process'

import config from '../config'
import util from '../util'

function injectScriptToHTML() {
    let ip = util.getIpList().filter((ip) => {
        return ip !== '127.0.0.1'
    })

    let script = '<script src="https://' + ip[0] + ':1337/vorlon.js"></script>'

    return 'html:(function (data) {var html = data.toString();'
        + 'html = html.replace(/<head>|<head\s[^<]*>/gi, function (match) {return match + \'' + script + '\';});'
        + 'html = html.replace(/Content-Security-Policy/ig, function (match) {return "hacky";});'
        + 'return html;})'
}

export default {
    injectScriptToHTML
}
