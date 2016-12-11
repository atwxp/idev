<template>
<div class="responder">
    <div class="responder-action">
        <span>
            <input type="checkbox" id="enable-rule" v-model="enableRule" />

            <label for="enable-rule">Enable Rules</label>
        </span>

        <button class="form-btn" @click="addRule">Add Rule</button>

        <button class="form-btn" @click="importRule">Import</button>
    </div>

    <div class="responder-editor">
        <div class="responder-editor-input">
            <input class="form-input" placeholder="your custom pattern" type="text" v-model="curRule.pattern">

            <div class="responder-editor-respond">
                <input class="form-input" placeholder="your custom responder" type="text" v-model="curRule.respond">

                <i class="icon-arrow" @click="toggleSelect"></i>

                <ul class="responder-editor-select" v-show="showSelect">
                    <li v-for="item in options" @click="doSelect(item)">
                        <input type="file" @click="clearSelect" @change="selectFile" v-show="item.label === 'file'"/>

                        <span class="responder-editor-option">{{item.value}}</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="responder-editor-op">
            <button class="form-btn">Test</button>

            <button class="form-btn" @click="saveRule(curRule)">Save</button>
        </div>
    </div>

    <div class="responder-list">
        <ul>
            <rule-item v-for="rule in ruleList" :rule="rule"
                v-on:checkedRule="saveRule"
                v-on:activeRule="activeRule"
                v-on:deleteRule="deleteRule"
                :active-id="activeId">
            </rule-item>
        </ul>
    </div>
</div>
</template>

<script>
import util from 'util'
import RuleItem from 'components/rule-item'

import { mapActions } from 'vuex'
import { mapGetters } from 'vuex'

export default {
    data () {
        return {
            options: [
                {
                    value: 'script with response',
                    label: 'script'
                },

                {
                    value: 'Find a file...',
                    label: 'file'
                },

                {
                    value: '200_Plain',
                    label: '200'
                },

                {
                    value: '404_Plain',
                    label: '404'
                }
            ],

            showSelect: false,

            curRule: {},

            activeId: ''
        }
    },

    computed: {
        enableRule: {
            get () {
                return this.uiconfig.enableRule
            },

            set (newVal) {
                this.updateUiConfig(['enableRule', newVal])
            }
        },

        ruleList () {
            return this.uiconfig.ruleList
        },

        ...mapGetters(['uiconfig'])
    },

    methods: {
        ...mapActions([
            'updateUiConfig',

            'updateRulelist',

            'deleteRulelist'
        ]),

        importRule () {

        },

        // todo: repeated rule should be filter or do nothing??
        saveRule (rule, notClear = false) {
            rule = rule || this.curRule

            if (
                (!rule.pattern || !rule.pattern.trim())
                && (!rule.respond || !rule.respond.trim())
            ) {
                return
            }

            if (!rule.id) {
                rule = util.extend({
                    id: util.gid(),
                    checked: false,
                }, rule)
            }

            this.updateRulelist([rule.id, rule])

            !notClear && (this.curRule = {})

            return rule
        },

        activeRule (rule) {
            this.curRule = {
                id: rule.id,
                pattern: rule.pattern,
                respond: rule.respond
            }

            this.activeId = rule.id
        },

        deleteRule (rule) {
            this.deleteRulelist(rule.id)

            if (this.curRule.id === rule.id) {
                this.curRule = {}
            }
        },

        addRule () {
            let r = {
                pattern: 'http://example.com',
                respond: ''
            }

            this.activeRule(this.saveRule(r))
        },

        toggleSelect () {
            this.showSelect = !this.showSelect
        },

        clearSelect (e) {
            e.currentTarget.value = ''
        },

        selectFile (e) {
            let files = e.target.files

            let file = files && files[0]

            let formData = new FormData()

            formData.append('localFile', file)

            this.$http.post('/api/getFilePath', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((response) => {
                try {
                    response = JSON.parse(response.body)
                }
                catch (e) {
                    response = {}
                }

                // {
                //     fieldName: 'your field name',
                //     originalFilename: 'filename.json',
                //     // options.uploadDir || os.tmpdir()(/var/folders/xh/zjcqwpfs70zd3b4dt9lz5m500000gn/T/)
                //     path: '/var/folders/xh/zjcqwpfs70zd3b4dt9lz5m500000gn/T/4JHmEH7UdxI3eWUkRcj5kph1.json',
                //     headers: {
                //         'content-disposition': 'form-data; name="your field name"; filename="filename.json"',
                //         'content-type': 'application/json'
                //     },
                //     size: 18948
                // }

                this.curRule = Object.assign({}, this.curRule, {
                    respond: file.name,
                    filepath: response.path
                })

            })
        },

        doSelect (sop) {
            switch (sop.label) {
                case 'script':
                    break

                case 'file':
                    break

                default:
            }

            this.showSelect = false
        }
    },

    components: {
        RuleItem
    }
}
</script>

<style lang="less" src="./index.less"></style>
