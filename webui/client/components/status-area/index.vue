<template>
<div class="status-area">
    <div class="status-bar">
        <ul>
            <li v-for="t in tab" @click="activeId = t.id" :class="{active: activeId == t.id,'editing':t.editing}">{{t.text | camelCase}}</li>
        </ul>
    </div>

    <div class="status-content">
        <keep-alive>
            <component :is="tab[activeId].view"></component>
        </keep-alive>
    </div>
</div>
</template>

<script>
import inspector from 'components/inspector'
import responder from 'components/responder'
import composer from 'components/composer'
import wizard from 'components/wizard'
import Vorlon from 'components/vorlon'

export default {
    data () {
        return {
            tab: [
                {
                    id: 0,
                    view: 'inspector',
                    text: 'inspector'
                },
                {
                    id: 1,
                    view: 'responder',
                    text: 'auto-responder',
                    isActive: false
                },
                {
                    id: 2,
                    view: 'composer',
                    text: 'composer'
                },
                {
                    id: 3,
                    view: 'wizard',
                    text: 'text-wizard'
                },
                {
                    id: 4,
                    view: 'vorlon',
                    text: 'vorlon',
                    editing: false
                }
            ],

            activeId: 0
        }
    },

    created () {
        window.bus.$on('codeChange', (v) => {
            this.tab.forEach((t) => {
                t.editing = t.view === 'vorlon' && v
            })
        })
    },

    components: {
        inspector,
        responder,
        composer,
        wizard,
        Vorlon
    }
};
</script>

<style lang="less" src="./index.less"></style>
