<template>
    <div class="inspector">
        <div class="req-inspector">
            <ul class="inspector-bar">
                <li v-for="(n, index) in reqNav" @click="toggleGroup('req', index)" v-bind:class="{active: n.isActive}">{{n.text | camelCase}}</li>
            </ul>

            <div class="inspector-content">
                <inspector-table type="req-inspector-headers" v-show="currentReqView=='headers'" :info="reqData.headers"></inspector-table>

                <inspector-table type="req-inspector-cookies" v-show="currentReqView=='cookies'" :info="reqData.cookies"></inspector-table>

                <inspector-table type="req-inspector-webform" v-show="currentReqView=='webform'" :info="reqData.webform"></inspector-table>
            </div>
        </div>

        <div class="res-inspector">
            <ul class="inspector-bar">
                <li v-for="(n, index) in resNav" @click="toggleGroup('res', index)"  v-bind:class="{active: n.isActive}">{{n.text | camelCase}}</li>
            </ul>

            <div class="inspector-content">
                <inspector-table type="res-inspector-headers" v-show="currentResView=='headers'" :info="resData.headers"></inspector-table>

                <div class="res-inspector-textview" v-show="currentResView=='textview'">
                    {{resData.textview}}
                </div>

                <div class="res-inspector-image" v-show="currentResView=='imageview'">
                    <img :src="resData.imageview" v-show="resData&&resData.imageview">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

import InspectorTable from 'components/inspector-table'
import InspectorContent from 'components/inspector-content'
import util from 'util'

export default {
    data () {
        return {
            reqNav: [
                {
                    view: 'headers',
                    text: 'headers',
                    isActive: true
                },
                {
                    view: 'cookies',
                    text: 'cookies',
                    isActive: false
                },
                {
                    view: 'webform',
                    text: 'web-forms',
                    isActive: false
                }
            ],
            resNav: [
                {
                    view: 'headers',
                    text: 'headers',
                    isActive: true
                },
                {
                    view: 'textview',
                    text: 'text-view',
                    isActive: false
                },
                {
                    view: 'syntaxview',
                    text: 'syntax-view',
                    isActive: false
                },
                {
                    view: 'imageview',
                    text: 'image-view',
                    isActive: false
                },
                {
                    view: 'json',
                    text: 'JSON',
                    isActive: false
                },
                {
                    view: 'cookies',
                    text: 'cookies',
                    isActive: false
                }
            ],

            reqData: {},

            resData: {},

            currentReqView: 'headers',

            currentResView: 'headers'
        }
    },

    // todo: 是否 watch sessionList
    computed: mapGetters({
        sessionList: 'allSession'
    }),

    components: {
        InspectorTable,
        InspectorContent
    },

    methods: {
        toggleGroup (type, index) {
            this[type + 'Nav'].forEach((v, i) => {
                v.isActive = i === index;
            });

            this['current' + util.camelCase(type + '-view')] = this[type + 'Nav'][index].view
        },

        // req
        getReqHeaders (session) {
            let d = {
                request: [session.method, session.path, session.protocol + '/' + session.httpVersion].join(' ')
            };

            [
                'host',
                'cookie', 'connection', 'proxy-connection', 'cache-control', 'user-agent',
                'accept', 'accept-encoding', 'accept-language',
                'referer'
            ].forEach((v) => {
                d[v] = session['reqHeaders'][v]
            })

            this.$set(this.reqData, 'headers', d)
        },

        getReqCookies (session) {
            let c = {};

            let rdecode = /(%[0-9A-Z]{2})+/g;

            let cookie = session['reqHeaders']['cookie'];

            cookie && cookie.split(/;\s*/).forEach((v) => {
                let parts = v.split('=')

                let ck = parts.slice(1).join('=')

                c[parts[0].replace(rdecode, decodeURIComponent)] = ck.replace(rdecode, decodeURIComponent)
            })

            this.$set(this.reqData, 'cookies', c)
        },

        getReqWebform (session) {
            this.$set(this.reqData, 'webform', session.query)
        },

        // res
        getResHeaders (session) {
            let d = {
                'response': [
                    session.protocol + '/' + session.httpVersion,
                    session.status,
                    session.statusMessage
                ].join(' '),

                'content-length': session.contentLength
            };

            [
                'content-type', 'content-encoding', 'transfer-encoding',
                'cache-control', 'date', 'expires', 'vary', 'last-modified',
                'server', 'connection',
                'access-control-allow-origin',
                'access-control-expose-headers',
                'x-powered-by',
                'x-cache'
            ].forEach((v) => {
                d[v] = session['resHeaders'][v]
            })

            d['access-control-expose-headers'].forEach((v) => {
                d[v] = session[resHeaders][v]
            })

            this.$set(this.resData, 'headers', d)
        },

        getResTextview (session) {
            this.$set(this.resData, 'textview', session.textview)
        },

        getResSyntaxview () {

        },

        getResImageview (session) {
            this.$set(this.resData, 'imageview', /^image\//i.test(session['resHeaders']['content-type']) ? session.url : '')
        },

        getResJson () {

        },

        getResCookies () {

        },

        getInfo (session) {
            let me = this;

            ['req', 'res'].forEach((v) => {
                me[v + 'Nav'].forEach((nav) => {
                    me['get' + util.camelCase(v + '-' + nav.view)](session)
                })
            })
        }
    },

    created () {
        window.bus.$on('detailSession', (idx) => {
            this.getInfo(this.sessionList[idx - 1])
        })
    }
}
</script>

<style lang="less" src="./index.less"></style>
