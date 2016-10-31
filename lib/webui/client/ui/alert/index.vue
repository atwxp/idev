<template>
    <modal :showing.sync="showing">
       <div class="alert-content" :class="{info: type == 'info', warning: type == 'warning', error: type == 'error'}">
            {{msg}}
        </div>

        <button slot="footer" @click="sure">Sure</button>
    </modal>
</template>

<script>

import modal from 'ui/modal';

export default {
    props: {
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
        },

        onSure: {
            type: Function
        }
    },

    components: {
        modal
    },

    methods: {
        sure () {
            // http://www.cnblogs.com/kidsitcn/p/5409994.html
            // anti-pattern this.showing = false
            // Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders
            this.showing = false

            this.onSure && this.onSure()

            this.$emit('sure')
        }
    }
};
</script>

<style lang="less" src="./index.less"></style>
