<template>
<div class="req-area">
    <ul class="req-bar">
        <li v-for="n in nav" :class="n">{{n | capitalize}}</li>
    </ul>

    <div class="req-content">
        <ul class="req-list">
            <li v-for="(req, key) in sessionList" @click="selected=req.id" :class="[{selected: selected==req.id}, req.cls]">
                <span class="order">{{req.id}}</span>

                <span class="status">{{req.status}}</span>

                <span class="protocol">{{req.protocol}}</span>

                <span class="host" v-bind:title="req.host">{{req.host}}</span>

                <span class="url" v-bind:title="req.pathname">{{req.pathname}}</span>

                <span class="content-type" v-bind:title="req.contentType">{{req.contentType}}</span>

                <span class="server-ip">{{req.cls}}</span>
            </li>
        </ul>
    </div>
</div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
    data () {
        return {
            nav: ['order', 'status', 'protocol', 'host', 'url', 'content-type', 'server-ip'],
            selected: -1
        }
    },

    computed: mapGetters({
        sessionList: 'allSession'
    })
}
</script>

<style lang="less" src="./index.less"></style>
