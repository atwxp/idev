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
        <span class="responder-editor-input">
            <input class="form-input" placeholder="your custom pattern" type="text" v-model="curRule.pattern">
            <input class="form-input" placeholder="your custom responder" type="text" v-model="curRule.respond">
        </span>

        <span class="responder-editor-op">
            <button class="form-btn">Test</button>
            <button class="form-btn" @click="saveRule">Save</button>
        </span>
    </div>

    <div class="responder-list">
        <ul>
            <rule-item v-for="rule in ruleList" :rule="rule" v-on:activeRule="activeRule" v-on:deleteRule="deleteRule"></rule-item>
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
            enabled: false,

            ruleList: [],

            curRule: {}
        }
    },

    watch: {
        enabled (val) {
            window.bus.$emit('enableRespond', val)
        }
    },

    methods: {
        saveRule (e, rule) {
            rule = rule || this.curRule

            if (!rule.pattern && ! rule.respond) {
                return
            }

            let trule

            if (rule.id) {
                trule = this.ruleList.filter((r) => {
                    return r.id == rule.id
                })
            }

            if (trule && trule[0]) {
                util.extend(trule[0], rule)
            }
            else {
                this.ruleList.push(util.extend({
                    id: util.gid(),
                    active: false,
                    checked: false,
                    showDel: false
                }, rule));
            }

            this.curRule = {}
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
                id: util.gid(),
                pattern: 'http://example.com',
                respond: ''
            }

            this.saveRule(null, r)

            this.activeRule(r)
        },

        importRule () {

        }
    },

    components: {
        RuleItem
    }
}
</script>

<style lang="less" src="./index.less"></style>
