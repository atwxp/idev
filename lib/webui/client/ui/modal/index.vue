<template>

<transition name="modal-fade">
    <div class="modal-content" v-show="showing">

        <div name="modal-header" v-if="title">
            <h4 class="modal-title">{{title}}</h4>
        </div>

        <div class="modal-body">
            <slot>
                <div v-if="content">
                    {{content}}
                </div>
            </slot>
        </div>

        <div class="modal-footer" v-if="!hideCloseBtn">
            <slot name="footer">
                <button @click="close">Close</button>
            </slot>
        </div>
    </div>
</transition>

</template>

<script>

import overlayMixin from 'ui/overlay/overlay-mixin';

export default {
    mixins: [overlayMixin],

    props: {
        title: {
            type: String,
            default: ''
        },

        content: {
            type: String,
            default: ''
        },

        hideCloseBtn: {
            type: Boolean,
            default: false
        },

        backdrop: {
            type: Boolean,
            default: true
        }
    },

    methods: {
        close () {
            this.showing = false
        },

        overlayClick () {
            this.showing = !this.backdrop
        }
    }
};

</script>

<style lang="less" src="./index.less"></style>
