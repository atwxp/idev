<template>
    <li :class="['rule-item', {'rule-active': rule.id==activeId}]" @mouseenter="showDel=true" @mouseleave="showDel=false">

        <input type="checkbox" name="rule" v-model="rule.checked" @change="checkedRule" />

        <label @click="activeRule">
            <span>{{rule.pattern}}</span>|<span>{{rule.respond}}</span>
        </label>

        <i class="rule-delete" v-show="showDel" @click="deleteRule"></i>
    </li>
</template>

<script>
export default {
    data () {
        return {
            showDel: false
        }
    },

    props: ['rule', 'activeId'],

    methods: {
        checkedRule () {
            this.$emit('checkedRule', this.rule, true)
        },

        activeRule () {
            this.$emit('activeRule', this.rule)
        },

        deleteRule () {
            this.$emit('deleteRule', this.rule)
        }
    }
}
</script>

<style lang="less" src="./index.less"></style>
