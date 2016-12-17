import * as types from 'store/mutation-types'

const state = {
    enableRule: false,
    interceptHttps: false,
    ruleList: [],
    vorlon: []
}

const getters = {
    uiconfig: state => state
}

const mutations = {
    [types.SET_CONFIG] (state, cfg = {}) {
        Object.assign(state, cfg)
    },

    [types.TOGGLE_ENABLE_RULE] (state, enable) {
        state.enableRule = enable
    },

    [types.TOGGLE_ENABLE_HTTPS] (state, enable) {
        state.interceptHttps = enable
    },

    [types.ADD_RULE] (state, rule = []) {

        rule = Array.isArray(rule) ? rule : [rule]

        state.ruleList = [...(state.ruleList || []), ...rule]
    },

    [types.UPDATE_RULE] (state, rule = {}) {
        state.ruleList = (state.ruleList || []).map((v) => {
            if (rule.id === v.id) {
                return Object.assign(v, rule)
            }
            return v
        })
    },

    [types.DELETE_RULE] (state, idx) {
        state.ruleList = (state.ruleList || []).filter((r) => {
            return r.id !== idx
        })
    },

    [types.UPDATE_VORLON] (state, val) {
        state.vorlon = val
    }
}

const actions = {
    setConfig ({commit, state}, o) {
        commit(types.SET_CONFIG, o)
    },

    toggleEnableRule ({commit, state}, v) {
        commit(types.TOGGLE_ENABLE_RULE, v)
    },

    toggleEnableHttps ({commit, state}, v) {
        commit(types.TOGGLE_ENABLE_HTTPS, v)
    },

    addRule ({commit, state}, rule) {
        commit(types.ADD_RULE, rule)
    },

    updateRule ({commit, state}, rule) {
        commit(types.UPDATE_RULE, rule)
    },

    deleteRule ({commit, state}, idx) {
        commit(types.DELETE_RULE, idx)
    },

    updateVorlon ({commit}, val) {
        commit(types.UPDATE_VORLON, val)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
