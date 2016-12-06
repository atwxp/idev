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

    <modal :showing.sync="httpsModal" cls="https-modal" v-on:close="httpsModal=false">
        <qrcode cls="qrcode-row" :value="httpsCAData" size="270"></qrcode>
        <div class="intercept-row">
            <input type="checkbox" name="itercept" id="intercept" v-model="isInterceptHttps" />
            <label for="intercept">Intercept HTTPS CONNECT</label>
        </div>
    </modal>
</div>
</template>

<script>
import Vue from 'vue'
import socketClient from 'socket.io-client'

import ToolArea from 'components/tool-area'
import ReqArea from 'components/req-area'
import StatusArea from 'components/status-area'

import Alert from 'ui/alert'
import Modal from 'ui/modal'

import Qrcode from 'v-qrcode/src/index'

import { mapActions } from 'vuex'

// global data bus
window.bus = new Vue()

export default {
    data () {
        return {
            socket: null,
            network: {},
            onlineModal: false,
            httpsModal: false,
            httpsCAData: '',
            isInterceptHttps: false
        }
    },

    components: {
        ToolArea,
        ReqArea,
        StatusArea,
        Alert,
        Modal,
        Qrcode
    },

    watch: {
        isInterceptHttps (val) {
            this.socket.emit('interceptHttps', val)
        }
    },

    mounted () {
        // - http://ip:8889/cgi/rootCA
        this.httpsCAData = 'http://' + location.hostname+ ':' + UIPORT + '/cgi/rootCA';

        const socket = this.socket = socketClient('http://' + location.hostname + ':' + UIPORT + '/')

        // 监听到请求后更新到 webui 的 req-area, status-area
        socket.on('reqArrival', (data) => {
            data && this.addSession(data);
        })

        // 获取 IP 端口网络信息，通知到 tool-area 的 online 选项
        socket.on('join', (data) => {
            this.network = data;
        })

        // show online info
        window.bus.$on('openOnline', (val) => {
            this.onlineModal = val
        })

        // show https qrcode
        window.bus.$on('openHttps', (val) => {
            this.httpsModal = val
        })
    },

    methods: mapActions([
        'addSession'
    ])
};
</script>

<style lang="less" src="./index.less"></style>
