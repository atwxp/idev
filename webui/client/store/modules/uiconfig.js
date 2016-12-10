import * as types from 'store/mutation-types'

const state = {
    uiconfig: {
        interceptHttps: false,

        enableRule: false,

        ruleList: {}
    }
}

const getters = {
    uiconfig: state => state.uiconfig
}

const mutations = {
    [types.UPDATE_UICONFIG] (state, val) {
        state.uiconfig = Object.assign({}, state.uiconfig, val)
    }
}

const actions = {
    updateUiConfig ({commit, state}, option) {
        commit(types.UPDATE_UICONFIG, option)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
