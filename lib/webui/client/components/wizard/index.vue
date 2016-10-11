<template>
    <div class="wizard">
        <div>
            <textarea class="form-control raw-text" name="raw"></textarea>
        </div>

        <form action="#" data-role="enctype-form">
            <ul class="enctype">
                <li>
                    <input type="radio" value="unicode-encode" name="codec" id="unicode-encode" checked>
                    <label for="unicode-encode">unicode编码</label>
                </li>
                <li>
                    <input type="radio" value="unicode-decode" name="codec" id="unicode-decode">
                    <label for="unicode-decode">unicode解码</label>
                </li>
                <li>
                    <input type="radio" value="utf8-encode" name="codec">
                    <label for="utf8-encode">utf8编码</label>
                </li>
                <li>
                    <input type="radio" value="utf8-decode" name="codec">
                    <label for="utf8-decode">utf8解码</label>
                </li>
                <li>
                    <input type="radio" value="base64-encode" name="codec">
                    <label for="base64-encode">base64编码</label>
                </li>
                <li>
                    <input type="radio" value="base64-decode" name="codec">
                    <label for="base64-decode">base64解码</label>
                </li>
            </ul>

            <div class="btns">
                <button type="button" class="btn convert" name="convert">转换</button>
                <button type="button" class="btn clear" name="clear">清空</button>
            </div>
        </form>

        <div>
            <textarea class="form-control result-text" name="result"></textarea>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {

            }
        }
    }
</script>

<style scoped lang="less" src="./index.less"></style>
