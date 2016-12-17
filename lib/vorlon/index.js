import cp from 'child_process'

import config from '../config'

function injectScriptToHTML() {
    let func = function (data) {
        var html = data.toString();

        // todo:
        var script = '<script src="http://192.168.31.64:1337/vorlon.js"></script>';

        html = html.replace(/<head>|<head\s[^<]*>/gi, function (match) {
            return match + script;
        });

        html = html.replace(/Content-Security-Policy/ig, function (match) {
            return 'hacky';
        });

        return html;
    }

    return 'html:(' + func.toString() + ')'
}

export default {
    injectScriptToHTML
}
