<template>
<div class="tool-area">
    <ul>
        <li v-for="m in tool" @click="dealClick(m)">{{m | camelCase}}</li>
    </ul>
</div>
</template>

<script>
import util from 'util'

export default {
    data () {
        return {
            tool: ['clear', 'replay', 'https', 'weinre', 'jsconsole', 'online']
        }
    },

    methods: {
        dealClick (m) {

            switch (m) {
                case 'online':
                case 'https':
                    window.bus.$emit('open' + util.capitalize(m), true)
                    break

                default:
            }
        }
    }
};
</script>

<style lang="less" src="./index.less"></style>
