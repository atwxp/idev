<template>
    <modal :showing.sync="showing" :cls="cls" v-on:close="close">
       <p class="alert-content" :class="{
            info: type == 'info',
            warning: type == 'warning',
            error: type == 'error'
        }">
            {{msg}}
        </p>

        <button slot="footer" class="btn" @click="sure">确定</button>
    </modal>
</template>

<script>

import modal from 'ui/modal';

export default {
    props: {
        cls: {
            type: String,
            default: ''
        },

        showing: {
            type: Boolean,
            default: false
        },

        msg: {
            type: String,
            default: ''
        },

        type: {
            type: String,
            default: '' // 'info/warning/error'
        }
    },

    components: {
        modal
    },

    methods: {
        close () {
            this.$emit('close')
        },

        sure () {
            this.$emit('sure')

            this.close()
        }
    }
};
</script>

<style lang="less" src="./index.less"></style>
