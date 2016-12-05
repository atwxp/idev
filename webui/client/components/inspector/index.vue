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

            <div class="req-inspector-textview" v-show="currentReqView=='textview'">
                {{reqData.textview}}
            </div>
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

            <div class="res-inspector-syntaxview" v-show="currentResView=='syntaxview'">
                <span class="res-inspector-syntaxview-tip" v-show="showSyntaxTip" @click="doSyntax">Response body can be syntax highlighting.Click to syntax on.</span>
            </div>

            <div class="res-inspector-image" v-show="currentResView=='imageview'">
                <img :src="resData.imageview" v-show="resData&&resData.imageview">
            </div>
        </div>
    </div>
</div>
</template>

<script>
import JSONFormatter from 'json-formatter-js'
import Beautify from 'js-beautify'
import Prism from 'prismjs'

import { mapGetters } from 'vuex'

import InspectorTable from 'components/inspector-table'

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
                },
                {
                    view: 'textview',
                    text: 'text-view',
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
                }
            ],

            reqData: {},

            resData: {},

            session: {},

            currentReqView: 'headers',

            currentResView: 'headers',

            showSyntaxTip: false
        }
    },

    // todo: 是否 watch sessionList
    computed: mapGetters({
        sessionList: 'allSession'
    }),

    components: {
        InspectorTable
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
                'host', 'cookie', 'if-modified-since',

                'content-type', 'content-length', 'x-requested-with', 'origin',

                'connection', 'proxy-connection','cache-control',

                'accept', 'accept-encoding', 'accept-language',

                'user-agent', 'referer'
            ].forEach((v) => {
                d[v] = session['reqHeader'][v]
            })

            this.$set(this.reqData, 'headers', d)
        },

        getReqCookies (session) {
            let c = {};

            let rdecode = /(%[0-9A-Z]{2})+/g;

            let cookie = session['reqHeader']['cookie'];

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

        getReqTextview (session) {
            this.$set(this.reqData, 'textview', session.reqBody)
        },

        // res
        getResHeaders (session) {
            let d = {
                'response': [
                    session.protocol + '/' + session.httpVersion,
                    session.status,
                    session.statusMessage
                ].join(' '),

                'body-length': session.bodyLength + '(' + util.formatSize(session.bodyLength) + ')',

                'content-length': session.contentLength + '(' + util.formatSize(session.contentLength) + ')',

                'content-type': session.contentType
            }

            let resHeader = session['resHeader'] || {};

            [
                'content-encoding', 'transfer-encoding',

                'cache-control', 'date', 'expires', 'vary', 'last-modified',

                'server', 'connection', 'set-cookie',

                'access-control-allow-origin', 'access-control-expose-headers',

                'x-powered-by', 'x-cache', 'x-cache-lookup',

                'tracecode'
            ].forEach((v) => {
                // \n not work
                d[v] = util.type(resHeader[v]) === 'array' ? resHeader[v].join('\n\n') : resHeader[v]
            })

            // x-client-ip, x-server-ip
            let exposeHeaders = d['access-control-expose-headers']

            exposeHeaders && exposeHeaders.split(/\s*,\s*/).forEach((v) => {
                d[v] = resHeader[util.camelCase(v, '-', '-', false, true)]
            })

            this.$set(this.resData, 'headers', d)
        },

        // todo: what other should not has textview ??
        getResTextview (session) {
            this.$set(this.resData, 'textview', /^image\//i.test(session.contentType) ? '' : session.resBody)
        },

        doSyntax () {
            this.showSyntaxTip = false

            let session = this.session

            let rawText = session.resBody

            let syntaxview

            let type = util.getContentType(session.contentType)

            type = !rawText ? '' : type

            // JSONP形式下的 callback name
            let funcName = null;

            // https://github.com/zxlie/FeHelper/blob/master/chrome/static/js/jsonformat/fe-jsonformat.js
            // jsonp should return application/javascript
            if (type === 'javascript' || type === 'html' || type === 'json') {
                // JSONP形式下的 json对象
                let jsonObj = null

                let reg = /^([\w\.]+)\(\s*([\s\S]*)\s*\)$/igm

                try {
                    let matches = reg.exec(rawText);

                    if (matches != null) {
                        funcName = matches[1]

                        let newSource = matches[2]

                        jsonObj = new Function('return ' + newSource)()
                    }
                }
                catch (e) {
                }

                try {
                    if (jsonObj == null || typeof jsonObj !== 'object') {
                        jsonObj = new Function('return ' + rawText)()

                        // eg: jsonp1("{\"ret\":\"0\", \"msg\":\"ok\"}")
                        if (typeof jsonObj === 'string') {
                            jsonObj = new Function('return ' + jsonObj)()
                        }
                    }
                }

                catch (e) {
                }

                // 是json格式，可以进行JSON自动格式化
                if (jsonObj != null && typeof jsonObj == 'object') {

                    // 要尽量保证格式化的东西一定是一个json，所以需要把内容进行JSON.stringify处理
                    try {
                        rawText = JSON.stringify(jsonObj)

                        type = 'jsonp'
                    }

                    // 通过JSON反解不出来的，一定有问题
                    catch (e) {
                    }
                }
            }

            // todo: try catch??
            switch (type) {
                case 'javascript':
                    syntaxview = ''
                        + '<pre><code class="language-javascript">'
                        + Prism.highlight(Beautify(rawText), Prism.languages.js)
                        + '</code></pre>'

                    break;

                case 'css':
                    syntaxview = ''
                        + '<pre><code class="language-css">'
                        + Prism.highlight(Beautify.css(rawText), Prism.languages.css)
                        + '</code></pre>'

                    break

                case 'html':
                    syntaxview = ''
                        + '<pre><code class="language-html">'
                        + Prism.highlight(Beautify.html(rawText), Prism.languages.html)
                        + '</code></pre>'

                    break

                case 'json':
                    syntaxview = new JSONFormatter(JSON.parse(rawText), true).render()

                    break

                case 'jsonp':
                    if (funcName) {
                        syntaxview = util.createNode(util.createNode(funcName + '(', 'p', 'callback-name'), 'div')

                        syntaxview.appendChild(new JSONFormatter(JSON.parse(rawText), true).render())

                        syntaxview.appendChild(util.createNode(')', 'p', 'callback-name'))
                    }
                    else {
                        syntaxview = new JSONFormatter(JSON.parse(rawText), true).render()
                    }

                    break

                default:
                    syntaxview = ''
            }

            this.$el.querySelector('.res-inspector-syntaxview').innerHTML = ''

            syntaxview && this.$el.querySelector('.res-inspector-syntaxview').appendChild(util.createNode(syntaxview))
        },

        getResImageview (session) {
            this.$set(this.resData, 'imageview', /^image\//i.test(session.contentType) ? session.url : '')
        },

        getInfo (session) {
            let me = this;

            ['req', 'res'].forEach((v) => {
                me[v + 'Nav'].forEach((nav) => {
                    me['get' + util.camelCase(v + '-' + nav.view)](session)
                })
            })

            this.showSyntaxTip = true
        }
    },

    created () {
        window.bus.$on('detailSession', (idx) => {
            this.session = this.sessionList[idx - 1]

            this.getInfo(this.session)
        })
    }
}
</script>

<style lang="less" src="./index.less"></style>
