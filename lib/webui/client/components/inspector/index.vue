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
                <li v-for="n in resNav"@click="toggleGroup('res', index)"  v-bind:class="{active: n.isActive}">{{n.text | camelCase}}</li>
            </ul>

            <div class="inspector-content">

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
                    text: 'textview',
                    isActive: false
                },
                {
                    view: 'json',
                    text: 'JSON',
                    isActive: false
                },
                {
                    view: 'raw',
                    text: 'raw',
                    isActive: false
                }
            ],

            reqData: {},

            resData: {},

            currentReqView: 'headers',

            currentResView: 'headers'
        }
    },

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

            this.currentReqView = this[type + 'Nav'][index].view
        },

        getReqHeaders (session) {
            let d = {
                request: [session.method, session.path, session.protocol + '/' + session.httpVersion].join(' ')
            };

            ['host', 'cookie', 'connection', 'user-agent', 'accept', 'accept-encoding', 'accept-language', 'referer'].forEach((v) => {
                d[v] = session['reqHeaders'][v]
            })

            this.reqData = Object.assign({}, this.reqData, {headers: d})
        },

        getReqCookies (session) {
            let c = {}

            // todo: cookies parse
            let cookie = session['reqHeaders']['cookie'];
            cookie && cookie.split(/;\s*/).forEach((v) => {
                let arr = v.split('=');

                c[arr[0]] = arr[1]
            })

            this.reqData = Object.assign({}, this.reqData, {cookies: c})
        },

        getReqWebform (session) {
            this.reqData = Object.assign({}, this.reqData, {webform: session.query});
        },

        getInfo (session) {
            let me = this;

            // ['req', 'res'].forEach((v) => {
            ['req'].forEach((v) => {
                me[v + 'Nav'].forEach((nav) => {
                    me['get' + util.capitalize(v) + util.capitalize(nav.view)](session)
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
