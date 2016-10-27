<template>
    <div class="main">
        <tool-bar></tool-bar>

        <req-area></req-area>

        <status-area></status-area>
    </div>
</template>

<script>
import Vue from 'vue';
import socketClient from 'socket.io-client';

import toolBar from './components/tool-bar';
import reqArea from './components/req-area';
import statusArea from './components/status-area';

// global data bus
window.bus = new Vue();

export default {
    data () {
        return {};
    },

    components: {
        toolBar,
        reqArea,
        statusArea
    },

    created: function () {
        var url = 'http://' + location.hostname + ':8889';

        const socket = socketClient(url);

        // 监听到请求后更新到 webui 的 req-area, status-area
        socket.on('reqArrival', (data) => {
            console.log(data);
            // window.bus.$emit('reqArrival', data);
        });

        // 获取 IP 端口网络信息，通知到 tool-bar 的 online 选项
        socket.on('join', (data) => {
            // window.bus.$emit('online', data);
        });
    }
};
</script>

<style lang="less" src="./index.less"></style>
