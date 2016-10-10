<template>
    <div class="main">
        <div class="header">
            <tool-bar></tool-bar>
        </div>

        <div class="content">
            <div class="req-area"></div>

            <div class="status-area"></div>
        </div>

        <div class="footer"></div>
    </div>
</template>

<script>

import toolBar from './components/tool-bar';

export default {
    data () {
        return {};
    },
    components: {
        'tool-bar': toolBar
    }
};

</script>

<style lang="less" src="./index.less"></style>
