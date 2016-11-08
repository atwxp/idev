<template>
<ul :class="type">
    <li class="inspector-row" v-for="(value, key) in info">
        <span class="label">{{key | capitalize}}</span>
        <span class="value">{{value}}</span>
    </li>
</ul>
</template>

<script>
export default {
    props: ['type', 'info']
}
</script>

<style lang="less" src="./index.less"></style>
