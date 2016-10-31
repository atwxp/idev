import Vue from 'vue';
import overlayCom from './index';

const Overlay = Vue.extend(overlayCom);

export default {
    instances: [],

    overlay: false,

    open (instance) {
        if (!instance && this.instances.indexOf(instance) !== -1) {
            return
        }

        if (!this.instances.length) {
            this.showLay(instance.color)
        }

        this.instances.push(instance)

        this.changeLayStyle()

        // todo get dom instance.$el
        // dom.style.zIndex = util.getIndex(Overlay.zIndex);
    },

    close (instance) {
        let index = this.instances.indexOf(instance)

        if (index === -1) {
            return
        }
        Vue.nextTick(() => {
            this.instances.splice(index, 1)

            if (!this.instances.length) {
                this.closeLay()
            }

            this.changeLayStyle()
        });
    },

    showLay (color) {
        let overlay = this.overlay = new Overlay({
            el: document.createElement('div')
        })

        overlay.color = color

        overlay.onClick = this.handleOverlayClick.bind(this)

        document.body.appendChild(overlay.$el);

        // util.getComputedStyle
        // this.bodyOverflow = document.body.style.overflow;
        // document.body.style.overflow = 'hidden';
    },

    closeLay () {
        if (!this.overlay) {
            return
        }

        // document.body.style.overflow = this.bodyOverflow

        let overlay = this.overlay;

        this.overlay = null;

        overlay.$el.remove(() => {
            overlay.$destroy()
        })
    },

    changeLayStyle () {
        if (!this.overlay || !this.instances.length) {
            return
        }

        const instance = this.instances[this.instances.length - 1]

        this.overlay.color = instance.color;
    },

    handleOverlayClick () {
        if (!this.instances.length) {
            return
        }

        const instance = this.instances[this.instances.length - 1]

        if (instance.overlayClick) {
            instance.overlayClick()
        }
    }
}
