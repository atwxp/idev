import Vue from 'vue'

import filter from './filters'
import store from './store'

import App from './index'

// install filter
filter(Vue)

new Vue({
    el: '#app',
    store,
    render: h => h(App)
})
