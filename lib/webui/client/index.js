import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';

import filter from './filters';

import App from './index';

// install router
Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: App
        }
    ]
});

// install resource
Vue.use(VueResource);

// install vuex
Vue.use(Vuex);

// install filter
filter(Vue);

new Vue({router}).$mount('#app');
