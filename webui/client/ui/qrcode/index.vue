<template>
    <div v-bind:class="cls"></div>
</template>

<script>
import QRious from 'qrious'

export default {
    props: {
        value: String,

        cls: {
            type: String,
            default: 'qrcode'
        },

        elem: {
            type: String,

            default: null,

            validator (value) {
                let node = document.querySelector(value)

                let nodeName = node && node.nodeName && node.nodeName.toLowerCase()

                return ['img', 'canvas', null].indexOf(nodeName) > -1
            }
        },

        size: {
            type: [Number, String],
            default: 100
        },

        level: {
            type: String,
            default: 'L'
        },

        background: {
            type: String,
            default: '#fff'
        },

        foreground: {
            type: String,
            default: '#000'
        },

        mime: {
            type: String,
            default: 'image/png'
        },

        padding: {
            type: Number,
            default: 0
        },

        type: {
            type: String,
            // canvas, image
            default: 'canvas'
        }
    },

    watch: {
        'value' () {
            this.render()
        }
    },

    methods: {
        render () {
            const qr = new QRious({
                element: document.querySelector(this.elem),
                background: this.background,
                foreground: this.foreground,
                level: this.level,
                padding: this.padding,
                size: this.size,
                value: this.value
            });

            this.$el.innerHTML = ''

            this.$el.appendChild(qr[this.type])
        }
    },

    mounted () {
        this.render()
    }
}

</script>
