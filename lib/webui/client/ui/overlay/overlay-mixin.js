import manager from './manager';

export default {
    props: {
        showing: {
            type: Boolean,
            default: false
        },

        overlay: {
            type: Boolean,
            default: true
        },

        color: {
            type: String,
            default: 'rgba(0, 0, 0, .5)'
        }
    },

    mounted () {
        this.$nextTick(() => {
            if (this.showing && this.overlay) {
                manager.open(this)
            }
        });
    },

    // beforeDestroy () {
    //     manager.close(this)
    // },

    destroyed () {
        this.$nextTick(() => {
            manager.close(this)
        });
    },

    watch: {
        showing (val) {
            if (val && this.overlay) {
                manager.open(this)
            }

            else {
                manager.close(this)
            }
        }
    }
}
