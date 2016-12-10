import Vue from 'vue'
import VueResource from 'vue-resource'

import filter from './filters'
import store from './store'

import App from './index'

Vue.use(VueResource)

// install filter
filter(Vue)

new Vue({
    el: '#app',
    store,
    render: h => h(App)
})
