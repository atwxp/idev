<template>
    <div class="toolbar">
        <ul>
            <li v-for="m in tool">{{m | camelCase}}</li>
        </ul>
    </div>
</template>

<script>

export default {
    data () {
        return {
            tool: ['clear', 'replay', 'https', 'weinre', 'online']
        }
    },

    created: function () {

    }
};
</script>

<style scoped lang="less" src="./index.less"></style>
