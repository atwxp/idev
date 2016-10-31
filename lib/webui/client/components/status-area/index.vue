<template>
    <div class="status-area">
        <ul>
            <li v-for="(t, index) in tab" @click="togglePanel(index)" v-bind:class="{active: t.isActive}">{{t.text | camelCase}}</li>
        </ul>

        <div class="status-content">
            <keep-alive>
                <component :is="currentView"></component>
            </keep-alive>
        </div>
    </div>
</template>

<script>
import util from 'util';

import inspector from 'components/inspector';
import responder from 'components/responder';
import composer from 'components/composer';
import wizard from 'components/wizard';
import log from 'components/log';

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
                },
                {
                    view: 'log',
                    text: 'log',
                    isActive: false
                }
            ],

            currentView: 'inspector'
        }
    },

    methods: {
        togglePanel (index) {

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
        wizard,
        log
    }
};
</script>

<style lang="less" src="./index.less"></style>
