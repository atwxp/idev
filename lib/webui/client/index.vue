<template>
    <div class="main">
        <tool-area v-on:onlineOpen="openOnline"></tool-area>

        <req-area></req-area>

        <status-area></status-area>

        <alert :showing.sync="online.showing" :msg="online.network" type="info"></alert>
    </div>
</template>

<script>
import Vue from 'vue';
import socketClient from 'socket.io-client';

import toolArea from 'components/tool-area';
import reqArea from 'components/req-area';
import statusArea from 'components/status-area';

import alert from 'ui/alert';
import modal from 'ui/modal';

// global data bus
window.bus = new Vue();

export default {
    data () {
        return {
            online: {
                network: '',
                showing: false
            }
        }
    },

    components: {
        toolArea,
        reqArea,
        statusArea,
        alert,
        modal
    },

    methods: {
        openOnline () {
            this.online.showing = true
        }
    },

    created () {
        var url = 'http://' + location.hostname + ':8889/';

        const socket = socketClient(url);

        // 监听到请求后更新到 webui 的 req-area, status-area
        socket.on('reqArrival', (data) => {
            console.log(data);
            // window.bus.$emit('reqArrival', data);
        });

        // 获取 IP 端口网络信息，通知到 tool-area 的 online 选项
        socket.on('join', (data) => {
            // todo: format info
            var str = '';

            Object.keys(data).forEach((k) => {
                str += k + ': ';

                if (data[k] instanceof Array) {
                    data[k].forEach((v) => {
                        str += v + '<br />'
                    })
                }
                else {
                    str += data[k] + '<br />'
                }
            });

            this.online.network = str;
        });
    }
};
</script>

<style lang="less" src="./index.less"></style>
