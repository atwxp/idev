<template>
    <div class="tool-area">
        <ul @click="clickNav">
            <li v-for="m in tool">{{m.text | camelCase}}</li>
        </ul>
    </div>
</template>

<script>
import util from 'util';

export default {
    data () {
        return {
            tool: [
                {
                    text: 'clear'
                },

                {
                    text: 'replay'
                },

                {
                    text: 'https'
                },

                {
                    text: 'weinre'
                },

                {
                    text: 'online'
                }
            ]
        }
    },

    methods: {
        openOnline () {
            this.$emit('onlineOpen');
        },

        clickNav (event) {
            let target = event.target

            let cb = this['open' + util.capitalize(target.textContent)]

            cb && cb()
        }
    }
};
</script>

<style lang="less" src="./index.less"></style>
