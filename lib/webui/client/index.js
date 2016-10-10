import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';

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

new Vue({router}).$mount('#app')
