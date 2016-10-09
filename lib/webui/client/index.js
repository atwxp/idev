import Vue from 'Vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';

import App from './index';

// install router
Vue.use(VueRouter);

// install resource
Vue.use(VueResource);

const router = new VueRouter();

router.start(App, '#app');
