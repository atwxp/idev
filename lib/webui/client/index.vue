<template>
    <div class="main">
        <tool-bar></tool-bar>

        <req-area></req-area>

        <status-area></status-area>
    </div>
</template>

<script>
import Vue from 'vue';
import toolBar from './components/tool-bar';
import reqArea from './components/req-area';
import statusArea from './components/status-area';
import socketClient from 'socket.io-client';

// global data bus
window.bus = new Vue()

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

        socket.on('reqArrival', function (data) {
            console.log(data);
            // window.bus.$emit('reqArrival', data);
        });

        socket.emit('join');
    }
};
</script>

<style lang="less" src="./index.less"></style>
