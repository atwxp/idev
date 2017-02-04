/**
 * @file   http request record
 * @author wxp201013@163.com
 */

import webui from '../../webui/app'

let sessions = {}

let idx = 0

export function add(data) {
    idx++

    sessions['' + idx] = Object.assign({id: idx}, data)

    return idx
}

export function update(id, data) {
    sessions[id] = sessions[id] || {}

    Object.assign(sessions[id], data)
}

// 每隔一段时间才去通知 webui
setInterval(function () {
    // empty {}
    if (!Object.keys(sessions).length) {
        return
    }

    webui.client && webui.client.emit('reqArrival', sessions)

    sessions = {}

}, 2500)
