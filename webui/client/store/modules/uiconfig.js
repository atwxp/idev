import * as types from 'store/mutation-types'

const state = {
    uiconfig: {}
}

const getters = {
    uiconfig: state => state.uiconfig
}

const mutations = {
    [types.UPDATE_UICONFIG] (state, option = {}) {
        let o = {}

        if (Array.isArray(option)) {
            o[option[0]] = option[1]

        }
        else {
             o = option
        }

        state.uiconfig = Object.assign({}, state.uiconfig, o)
    },

    [types.UPDATE_RULELIST] (state, option = []) {
        let o = {}

        o[option[0]] = option[1]

        state.uiconfig = Object.assign({}, state.uiconfig, {
            ruleList: Object.assign({}, state.uiconfig.ruleList || {}, o)
        })
    },

    [types.DELETE_RULELIST] (state, idx) {
        let o = Object.assign({}, state.uiconfig.ruleList || {})

        delete o[idx]

        state.uiconfig = Object.assign({}, state.uiconfig, {
            ruleList: o
        })
    }
}

const actions = {
    updateUiConfig ({commit, state}, option) {
        commit(types.UPDATE_UICONFIG, option)
    },

    updateRulelist ({commit, state}, option) {
        commit(types.UPDATE_RULELIST, option)
    },

    deleteRulelist ({commit, state}, idx) {
        commit(types.DELETE_RULELIST, idx)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
