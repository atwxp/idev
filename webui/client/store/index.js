import Vue from  'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import session from './modules/session'
import uiconfig from './modules/uiconfig'

Vue.use(Vuex)

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        session,
        uiconfig
    }
})
