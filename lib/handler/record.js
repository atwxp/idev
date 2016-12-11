import webui from '../../webui/app'

let sessions = {};

let id = 0;

function add(data) {
    id++;

    sessions[id] = Object.assign({id: id}, data);

    return id;
}

function update(id, data) {
    sessions[id] = sessions[id] || {}

    Object.assign(sessions[id], data)
}

function setIndex(idx) {
    id = idx
}

// 每隔一段时间才去通知 webui
setInterval(function () {
    // empty {}
    if (!Object.keys(sessions).length) {
        return;
    }

    webui.client && webui.client.emit('reqArrival', sessions);

    sessions = {};

}, 2500);

export default {
    add,
    update,
    setIndex
}
