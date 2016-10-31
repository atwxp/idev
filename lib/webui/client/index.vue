<template>
    <div class="app">
        <tool-area></tool-area>

        <req-area></req-area>

        <status-area></status-area>

        <modal :showing.sync="onlineModal" cls="online-modal" v-on:close="onlineModal=false">
            <h5>Hostname: {{network.hostname}}</h5>
            <h5>Port: {{network.port}}</h5>
            <h5>IPV4:</h5>
            <p v-for="ip in network.ipv4">{{ip}}</p>
        </modal>
    </div>
</template>

<script>
import Vue from 'vue';
import socketClient from 'socket.io-client';

import ToolArea from 'components/tool-area';
import ReqArea from 'components/req-area';
import StatusArea from 'components/status-area';

import Alert from 'ui/alert';
import Modal from 'ui/modal';

// global data bus
window.bus = new Vue();

export default {
    data () {
        return {
            network: {},
            onlineModal: false
        }
    },

    components: {
        ToolArea,
        ReqArea,
        StatusArea,
        Alert,
        Modal
    },

    created () {
        var me = this;

        // todo: replace 8889 too uiport
        var url = 'http://' + location.hostname + ':8889/';

        const socket = socketClient(url);

        // 监听到请求后更新到 webui 的 req-area, status-area
        socket.on('reqArrival', (data) => {
            console.log(data);
            // window.bus.$emit('reqArrival', data);
        });

        // 获取 IP 端口网络信息，通知到 tool-area 的 online 选项
        socket.on('join', (data) => {
            this.network = data;
        });

        window.bus.$on('openOnline', function (val) {
            me.onlineModal = val;
        });
    }
};
</script>

<style lang="less" src="./index.less"></style>
