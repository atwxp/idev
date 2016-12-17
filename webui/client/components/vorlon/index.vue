<template>
<div class="codemirror" @keydown="doSave">
    <codemirror v-model="tcode" :options="editorOption" @changed="codeChange"></codemirror>
</div>
</template>

<script>
import {codemirror} from 'vue-codemirror'

import { mapState } from 'vuex'
import { mapActions } from 'vuex'

export default {
    data () {
        return  {
            tcode: '',

            editorOption: {
                tabSize: 4,
                mode: 'text/javascript',
                theme: '3024-day',
                lineNumbers: true,
                line: true,
                keyMap: 'sublime'
            }
        }
    },

    computed: {
        ...mapState({
            code: (state) => state.uiconfig.vorlon.join('\n')
        })
    },

    methods: {
        codeChange () {
            window.bus.$emit('codeChange', true)
        },

        doSave (e) {
            let keycode = e.keyCode

            // ctrl + s
            if (keycode === 83 && e.ctrlKey) {
                window.bus.$emit('codeChange', false)

                this.updateVorlon(this.tcode.trim().split('\n'))
            }
        },

        ...mapActions(['updateVorlon'])
    },

    mounted () {
        this.tcode = this.code
    },

    components: {
        codemirror
    }
}
</script>

<style lang="less" src="./index.less"></style>
