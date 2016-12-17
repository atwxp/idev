<template>
<div class="app">
    <div class="tool-area">
        <ul>
            <li v-for="(action, title) in tool" v-show="action.showing" @click="action.cb">{{title | camelCase}}</li>
        </ul>
    </div>

    <keep-alive>
        <component :is="activeView"></component>
    </keep-alive>

    <modal :showing.sync="onlineModal" cls="online-modal" v-on:close="onlineModal=false">
        <h5>Hostname: {{network.hostname}}</h5>

        <h5>Port: {{network.port}}</h5>

        <h5>IPV4:</h5>

        <p v-for="ip in network.ipv4">{{ip}}</p>
    </modal>

    <modal :showing.sync="httpsModal" cls="https-modal" v-on:close="httpsModal=false">
        <qrcode cls="qrcode-row" :value="httpsCAData" size="270"></qrcode>

        <div class="intercept-row">
            <input type="checkbox" name="itercept" id="intercept" v-model="interceptHttps" />

            <label for="intercept">Intercept HTTPS CONNECT</label>
        </div>
    </modal>
</div>
</template>

<script>
import Vue from 'vue'
import socketClient from 'socket.io-client'

import Network from 'components/session'
import Alert from 'ui/alert'
import Modal from 'ui/modal'
import Qrcode from 'v-qrcode/src/index'

import { mapActions } from 'vuex'
import { mapGetters } from 'vuex'

// global data bus
window.bus = new Vue()

export default {
    data () {
        return {
            tool: {
                'network': {
                    showing: false,
                    cb: this.showNetwork
                },

                'clear': {
                    showing: true,
                    cb: this.clearSession
                },

                'replay': {
                    showing: true,
                    cb: this.doReplay
                },

                'https': {
                    showing: true,
                    cb: this.showHttpsModal
                },

                'vorlon': {
                    showing: true,
                    cb: this.activeVorlon
                },

                'online': {
                    showing: true,
                    cb: this.showOnlineModal
                }
            },

            socket: null,

            network: {},

            onlineModal: false,

            httpsModal: false,

            httpsCAData: '',

            activeView: 'network'
        }
    },

    computed: {
        // https://zhenyong.github.io/vuex/forms.html
        interceptHttps: {
            get () {
                return this.uiconfig.interceptHttps
            },

            set (newVal) {
                this.toggleEnableHttps(newVal)
            }
        },
        ...mapGetters(['uiconfig'])
    },

    components: {
        Network,
        Alert,
        Modal,
        Qrcode
    },

    methods: {
        doReplay () {

        },

        showHttpsModal () {
            this.httpsModal = true
        },

        showOnlineModal () {
            this.onlineModal = true
        },

        showNetwork () {
            this.activeView = 'network'

            this.tool.network.showing = false

            this.tool.clear.showing = true
        },

        activeVorlon () {},

        ...mapActions([
            'addSession',

            'clearSession',

            'setConfig',

            'toggleEnableHttps'
        ])
    },

    created () {
        this.$watch('uiconfig', (newVal) => {
            this.socket.emit('updateConfig', newVal)
        }, {
            deep: true
        })

        this.$http.get('/api/getUiConfig').then((res) => {
            let data = res && res.body || {}

            this.setConfig(data)

            // http://ip:8889/cgi/rootCA
            this.httpsCAData = 'http://' + location.hostname + ':' + data.uiport + '/cgi/rootCA'

            const socket = this.socket = socketClient('http://' + location.hostname + ':' + data.uiport + '/')

            // 监听到请求后更新到 webui 的 req-area, status-area
            socket.on('reqArrival', (data) => {
                data && this.addSession(data)
            })

            // 获取 IP 端口网络信息，通知到 tool-area 的 online
            socket.on('join', (data) => {
                this.network = data
            })
        })

        window.bus.$on('modifyResponse', (option) => {
            this.socket.emit('modifyResponse', option)
        })
    }
};
</script>

<style lang="less" src="./index.less"></style>
