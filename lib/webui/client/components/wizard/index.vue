<template>
<div class="wizard">
    <div>
        <textarea class="form-control raw-text" name="raw" v-model="rawText" placeholder="粘贴需要进行编码转换的字符串"></textarea>
    </div>

    <form action="#" data-role="enctype-form">
        <ul class="enctype">
            <li>
                <input type="radio" value="unicode-encode" name="codec" v-model="codec" id="unicode-encode">
                <label for="unicode-encode">unicode编码</label>
            </li>
            <li>
                <input type="radio" value="unicode-decode" name="codec" v-model="codec" id="unicode-decode">
                <label for="unicode-decode">unicode解码</label>
            </li>
            <li>
                <input type="radio" value="utf8-encode" name="codec" v-model="codec" id="utf8-encode">
                <label for="utf8-encode">utf8编码</label>
            </li>
            <li>
                <input type="radio" value="utf8-decode" name="codec" v-model="codec" id="utf8-decode">
                <label for="utf8-decode">utf8解码</label>
            </li>
            <li>
                <input type="radio" value="base64-encode" name="codec" v-model="codec" id="base64-encode">
                <label for="base64-encode">base64编码</label>
            </li>
            <li>
                <input type="radio" value="base64-decode" name="codec" v-model="codec" id="base64-decode">
                <label for="base64-decode">base64解码</label>
            </li>
        </ul>

        <div class="btns">
            <button type="button" class="btn" name="convert" @click="convert()">转换</button>
            <button type="button" class="btn btn-clear" name="clear" @click="clear()">清空</button>
        </div>
    </form>

    <div>
        <textarea class="form-control result-text" name="result" v-model="resultText"></textarea>
    </div>
</div>
</template>

<script>
import util from 'util';

export default {
    data () {
        return {
            rawText: '',
            resultText: '',
            codec: 'unicode-encode'
        }
    },

    watch: {
        codec: 'convert'
    },

    methods: {
        convert () {
            let val = this.rawText;

            if (!val) {
                return;
            }

            let codec = util.capitalize(util.camelCase(this.codec), true);

            this.resultText = util[codec](val);
        },

        clear () {
            this.rawText = '';
            this.resultText = '';
        }
    }
}
</script>

<style lang="less" src="./index.less"></style>
