<template>
<div class="responder">
    <div class="responder-action">
        <span>
            <input type="checkbox" name="enable-rule" id="enable-rule" v-model="enabled" />
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
                        <input type="file" v-show="item.label === 'file'" @click="clearSelect" @change="selectFile" />

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
            <rule-item v-for="rule in ruleList" :rule="rule" v-on:checkedRule="saveRule" v-on:activeRule="activeRule" v-on:deleteRule="deleteRule"></rule-item>
        </ul>
    </div>
</div>
</template>

<script>
import RuleItem from 'components/rule-item'
import util from 'util'

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

            enabled: false,

            ruleList: [],

            curRule: {}
        }
    },

    watch: {
        enabled (val) {
            window.bus.$emit('enableRespond', val)
        },

        ruleList (val) {
            window.bus.$emit('updateRule', val);
        }
    },

    methods: {
        importRule () {

        },

        // todo: rule重复怎么办
        saveRule (rule, notClear = false) {
            rule = rule || this.curRule

            if (!rule.pattern && ! rule.respond) {
                return
            }

            let idx
            let newRule

            if (rule.id) {
                this.ruleList.filter((r, i) => {
                    if (r.id === rule.id) {
                        idx = i
                        return true
                    }
                })
            }

            if (idx !== undefined) {
                newRule = Object.assign(this.ruleList[idx], rule)

                this.ruleList.splice(idx, 1, newRule)
            }

            else {
                newRule = util.extend({
                    id: util.gid(),
                    active: false,
                    checked: false,
                    showDel: false
                }, rule)
                this.ruleList.push(newRule);
            }

            !notClear && (this.curRule = {})

            return newRule
        },

        activeRule (rule) {
            this.curRule = {
                id: rule.id,
                pattern: rule.pattern,
                respond: rule.respond
            }

            this.ruleList.forEach((r) => {
                r.active = rule.id === r.id
            })
        },

        deleteRule (rule) {
            let idx = this.ruleList.indexOf(rule)

            this.ruleList.splice(idx, 1)

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

// todo:
        selectFile (e) {
            let files = e.target.files

            let file = files && files[0]

            this.curRule = Object.assign({}, this.curRule, {
                respond: file.name
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
