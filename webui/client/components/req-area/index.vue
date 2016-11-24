<template>
<div class="req-area">
    <ul class="req-bar">
        <li v-for="n in nav" :class="n == '#' ? 'order' : n">{{n | camelCase('-', '-')}}</li>
    </ul>

    <div class="req-content">
        <ul class="req-list">
            <li v-for="req in matchUrl(sessionList)" @click="getDetail(req.id)" :class="[req.cls, {selected: selected == req.id}]">
                <span class="order">{{req.id}}</span>

                <span class="status">{{req.status}}</span>

                <span class="protocol">{{req.protocol}}</span>

                <span class="method">{{req.method}}</span>

                <span class="host" v-bind:title="req.host">{{req.host}}</span>

                <span class="path" v-bind:title="req.path">{{req.path}}</span>

                <span class="content-type" v-bind:title="req.contentType">{{req.contentType}}</span>

                <span class="server-ip">{{req.serverIp}}</span>
            </li>
        </ul>
    </div>

    <div class="req-filter">
        <input type="text" class="req-filter-input" v-model="filterText" placeholder="type filter url">
    </div>
</div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
    data () {
        return {
            nav: ['#', 'status', 'protocol', 'method', 'host', 'path', 'content-type', 'server-ip'],

            selected: -1,

            filterText: ''
        }
    },

    computed: mapGetters({
        sessionList: 'allSession'
    }),

    methods: {
        matchUrl (sessions) {
            let v = this.filterText.trim();

            if (!v) {
                return sessions;
            }

            // todo: pattern match?
            return sessions.filter((s) => {
                return s.url.indexOf(v) > -1
            })
        },

        getDetail (idx) {
            this.selected = idx

            window.bus.$emit('detailSession', idx)
        }
    }
}
</script>

<style lang="less" src="./index.less"></style>
