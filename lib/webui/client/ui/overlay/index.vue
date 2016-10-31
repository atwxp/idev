<template>
    <div class="overlay" @click="handleClick" @touchmove="prevent" :style="style"></div>
</template>

<script>
import util from 'util';

export default {
    props: {
        onClick: {
            type: Function
        },

        color: {
            type: String,
            default: 'rbga(0, 0, 0, .5)'
        }
    },

    data () {
        return {
            zIndex: util.getZIndex()
        }
    },

    computed: {
        style () {
            return {
                'background-color': this.color,
                'z-index': this.zIndex
            }
        }
    },

    methods: {
        prevent (event) {
            event.preventDefault()
            event.stopPropagation()
        },

        handleClick () {
            if (this.onClick) {
                this.onClick()
            }
        }
    }
}
</script>

<style src="./index.less" lang="less"></style>
