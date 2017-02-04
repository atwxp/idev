/**
 * @file   vuex entry
 * @author wxp201013@163.com
 */

import Vue from  'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'

import * as session from './modules/session'
import * as uiconfig from './modules/uiconfig'

Vue.use(Vuex)

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        session,
        uiconfig
    }
})
