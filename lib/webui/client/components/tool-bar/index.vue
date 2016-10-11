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
            tool: ['edit', 'plugins', 'replay', 'https', 'weinre', 'help', 'about', 'online']
        }
    }
};
</script>

<style scoped lang="less" src="./index.less"></style>
