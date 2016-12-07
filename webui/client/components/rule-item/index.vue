<template>
    <li :class="['rule-item', {'rule-active': rule.active}]" v-on:mouseenter="rule.showDel=true" v-on:mouseleave="rule.showDel=false">
        <input type="checkbox" name="rule" v-model="rule.checked"/>

        <label @click="activeRule">
            <span>{{rule.pattern}}</span>|<span>{{rule.respond}}</span>
        </label>

        <i class="rule-delete" v-show="rule.showDel" @click="deleteRule"></i>
    </li>
</template>

<script>
export default {
    props: ['rule'],

    methods: {
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
