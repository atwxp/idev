<template>
<div class="inspector">
    <div class="req-inspector">
        <ul class="inspector-bar">
            <li v-for="n in reqNav" @click="toggleGroup('req', n)"
                v-bind:class="{active: activeReqId == n.id}"
            >
                {{n.view | camelCase}}
            </li>
        </ul>

        <div class="inspector-content req-inspector-content">
            <inspector-table v-for="n in reqNav" v-show="activeReqId == n.id" :type="n.view"
                :info="reqData[n.view]"
            >
            </inspector-table>
        </div>
    </div>

    <div class="res-inspector">
        <ul class="inspector-bar">
            <li v-for="n in resNav" @click="toggleGroup('res', n)"
                v-bind:class="{active: activeResId == n.id}"
            >
                {{n.view | camelCase}}
            </li>
        </ul>

        <div class="inspector-content">
            <inspector-table type="res-inspector-headers" v-show="activeResId==0" :info="resData.headers"></inspector-table>

            <div class="res-inspector-textview" v-show="activeResId==1">
                <textarea :class="editing ? 'focus' : ''" ref="textarea" v-model="editValue" :readOnly="!editing"></textarea>

                <div class="res-inspector-textview-editor">
                    <span v-show="showRecover" @click="recoverResponse">
                        <i>Recover</i>
                    </span>

                    <span v-show="this.editing" @click="saveResponse">
                        <i>Save</i>
                    </span>

                    <span>
                        <i v-show="!this.editing&&resData.textview" @click="editResponse">Edit</i>
                        <i v-show="this.editing" @click="cancelResponse">Cancel</i>
                    </span>
                </div>
            </div>

            <div class="res-inspector-syntaxview" v-show="activeResId==2">
                <span class="res-inspector-syntaxview-tip" v-show="showSyntaxTip" @click="doSyntax">
                    Response body can be syntax highlighting.Click to syntax on.
                </span>

                <div v-html="resData.syntaxview"></div>
            </div>

            <div class="res-inspector-image" v-show="activeResId==3">
                <img :src="resData.imageview" v-show="resData && resData.imageview">
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
                    id: 0
                },
                {
                    view: 'cookies',
                    id: 1
                },
                {
                    view: 'web-forms',
                    id: 2
                },
                {
                    view: 'text-view',
                    id: 3
                }
            ],

            resNav: [
                {
                    view: 'headers',
                    id: 0
                },
                {
                    view: 'text-view',
                    id: 1
                },
                {
                    view: 'syntax-view',
                    id: 2
                },
                {
                    view: 'image-view',
                    id: 3
                }
            ],

            reqData: {},

            resData: {},

            session: {},

            activeReqId: 0,

            activeResId: 0,

            showSyntaxTip: false,

            editing: false,

            showRecover: false
        }
    },

    computed: {
        editValue () {
            return this.resData.textview
        },

        ...mapGetters([
            'sessionList'
        ])
    },

    watch: {
        'resData.textview' (val) {
            this.showSyntaxTip = !!val

            !val && this.clearSyntax()
        }
    },

    components: {
        InspectorTable
    },

    methods: {
        toggleGroup (type, n) {
            this[util.camelCase('active-' + type + '-id', '-', '', true)] = n.id
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
            let c = {}

            let rdecode = /(%[0-9A-Z]{2})+/g

            let cookie = session['reqHeader'] && session['reqHeader']['cookie'];

            cookie && cookie.split(/;\s*/).forEach((v) => {
                let parts = v.split('=')

                let ck = parts.slice(1).join('=')

                c[parts[0].replace(rdecode, decodeURIComponent)] = ck.replace(rdecode, decodeURIComponent)
            })

            this.$set(this.reqData, 'cookies', c)
        },

        getReqWebForms (session) {
            this.$set(this.reqData, 'web-forms', session.query)
        },

        getReqTextView (session) {
            let o = {};

            (session.reqBody || '').split('&').forEach((v) => {
                if (!v) {
                    return
                }

                v = v.split('=')

                o[v[0]] = decodeURIComponent(v[1] || '')
            })

            this.$set(this.reqData, 'text-view', o)
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

            this.showRecover = resHeader.idevRes
        },

        // todo: what other should not has textview ??
        getResTextView (session) {
            let rawText = session.resBody

            if (!rawText || /^image\//i.test(session.contentType)) {
                this.$set(this.resData, 'textview', '')

                return
            }

            let type = util.getContentType(session.contentType)

            let syntaxview = ''

            switch (type) {
                case 'javascript':
                    syntaxview = Beautify(rawText)
                    break

                case 'css':
                    syntaxview = Beautify.css(rawText)
                    break

                case 'html':
                    syntaxview = Beautify.html(rawText)
                    break

                default:
                    syntaxview = rawText
            }

            this.$set(this.resData, 'textview', syntaxview)
        },

        getResSyntaxView () {},

        clearSyntax () {
            this.$set(this.resData, 'syntaxview', '')
        },

        doSyntax () {
            this.showSyntaxTip = false

            let rawText = this.resData.textview

            let syntaxview

            let type = util.getContentType(this.resData.headers['content-type'])

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
                        + Prism.highlight(rawText, Prism.languages.js)
                        + '</code></pre>'

                    break

                case 'css':
                    syntaxview = ''
                        + '<pre><code class="language-css">'
                        + Prism.highlight(rawText, Prism.languages.css)
                        + '</code></pre>'

                    break

                case 'html':
                    syntaxview = ''
                        + '<pre><code class="language-html">'
                        + Prism.highlight(rawText, Prism.languages.html)
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

            this.clearSyntax()

            syntaxview && this.$set(this.resData, 'syntaxview', syntaxview)
        },

        getResImageView (session) {
            this.$set(this.resData, 'imageview', /^image\//i.test(session.contentType) ? session.url : '')
        },

        getInfo (session) {
            let me = this;

            ['req', 'res'].forEach((v) => {
                me[v + 'Nav'].forEach((nav) => {
                    let func = me['get' + util.camelCase(v + '-' + nav.view)]

                    func && util.type(func) === 'function' && func(session)
                })
            })
        },

        // redirect modify response
        recoverResponse () {
            this.showRecover = false

            window.bus.$emit('modifyResponse', {
                modified: false,
                fullUrl: this.session.host + this.session.path
            })
        },

        saveResponse () {
            let value = this.$refs.textarea.value

            this.resData.textview = value

            this.editing = false

            window.bus.$emit('modifyResponse', {
                modified: true,

                fullUrl: this.session.host + this.session.path,

                content: value,

                header: {
                    'content-type': this.session.contentType,
                    idevRes: true
                }
            })
        },

        cancelResponse () {
            this.editing = false
        },

        editResponse () {
            this.editing = true

            let textarea = this.$refs.textarea

            textarea.setSelectionRange(0, 0)

            textarea.focus()
        }
    },

    created () {
        window.bus.$on('detailSession', (idx) => {
            this.session = this.sessionList[idx] || {}

            this.getInfo(this.session)
        })
    }
}
</script>

<style lang="less" src="./index.less"></style>
