<template>
<div class="req-area">
    <ul class="req-bar">
        <li v-for="n in nav" :class="n == '#' ? 'order' : n">{{n | camelCase('-', '-')}}</li>
    </ul>

    <div class="req-content">
        <ul class="req-list">
            <li v-for="(req, index) in matchUrl(sessionList)" @click="getDetail(req)" :class="[req.cls, {selected: selected == req.id}]">
                <span class="order">{{index + 1}}</span>

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
import { mapState } from 'vuex'
import { mapActions } from 'vuex'

import * as util from 'util'

export default {
    data () {
        return {
            nav: ['#', 'status', 'protocol', 'method', 'host', 'path', 'content-type', 'server-ip'],

            filterText: ''
        }
    },

    computed: mapState({
        sessionList: (state, getters) => {
            return getters.sessionList.map((v) => {
                v.cls = [
                    util.getContentType(v.contentType) || '',
                    util.getStatusType(v.status) || ''
                ].join(' ')

                return v
            })
        },

        selected: (state) => state.session.activeId
    }),

    methods: {
        ...mapActions([
            'setActiveSessionId'
        ]),

        matchUrl (sessions) {
            let v = this.filterText.trim()

            if (!v) {
                return sessions
            }

            // todo: pattern match?
            return sessions.filter((s) => {
                return s.url && s.url.indexOf(v) > -1
            })
        },

        getDetail (req) {
            this.setActiveSessionId(req.id)
        }
    }
}
</script>

<style lang="less" src="./index.less"></style>
