<template>
    <div class="status-area">
        <ul>
            <li v-for="(t, index) in tab" @click="togglePanel(index)" v-bind:class="{active: t.isActive}">{{t.text | camelCase}}</li>
        </ul>

        <div class="status-content">
            <component :is="currentView"></component>
        </div>
    </div>
</template>

<script>
import util from '../../util';
import wizard from '../wizard';
import inspector from '../inspector';
import responder from '../responder';
import composer from '../composer';

export default {
    data () {
        return {
            tab: [
                {
                    view: 'inspector',
                    text: 'inspector',
                    isActive: true
                },
                {
                    view: 'responder',
                    text: 'auto-responder',
                    isActive: false
                },
                {
                    view: 'composer',
                    text: 'composer',
                    isActive: false
                },
                {
                    view: 'wizard',
                    text: 'text-wizard',
                    isActive: false
                }
            ],

            currentView: 'inspector'
        }
    },

    methods: {
        togglePanel: function (index) {

            this.tab.forEach((v, i) => {
                v.isActive = i === index;
            });

            this.currentView = this.tab[index].view;
        }
    },

    components: {
        inspector,
        responder,
        composer,
        wizard
    }
};
</script>

<style lang="less" src="./index.less"></style>
