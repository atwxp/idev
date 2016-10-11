<template>
    <div class="main">
        <tool-bar></tool-bar>

        <req-area></req-area>

        <divider-bar></divider-bar>

        <status-area></status-area>
    </div>
</template>

<script>
import toolBar from './components/tool-bar';
import reqArea from './components/req-area';
import dividerBar from './components/divider-bar';
import statusArea from './components/status-area';

export default {
    data () {
        return {};
    },

    components: {
        'tool-bar': toolBar,
        'req-area': reqArea,
        'divider-bar': dividerBar,
        'status-area': statusArea
    }
};
</script>

<style lang="less" src="./index.less"></style>
