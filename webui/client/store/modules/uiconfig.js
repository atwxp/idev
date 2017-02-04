/**
 * @file   uiconfig data
 * @author wxp201013@163.com
 */

import * as types from 'store/mutation-types'

export const state = {
    enableRule: false,

    interceptHttps: false,

    ruleList: [],

    vorlon: []
}

export const getters = {
    uiconfig(state) {
        return state
    }
}

export const mutations = {
    [types.SET_CONFIG](state, cfg = {}) {
        Object.assign(state, cfg)
    },

    [types.TOGGLE_ENABLE_RULE](state, enable) {
        state.enableRule = enable
    },

    [types.TOGGLE_ENABLE_HTTPS](state, enable) {
        state.interceptHttps = enable
    },

    [types.ADD_RULE](state, rule = []) {

        rule = Array.isArray(rule) ? rule : [rule]

        state.ruleList = [...(state.ruleList || []), ...rule]
    },

    [types.UPDATE_RULE](state, rule = {}) {
        state.ruleList = (state.ruleList || []).map(v => {
            if (rule.id === v.id) {
                return Object.assign(v, rule)
            }
            return v
        })
    },

    [types.DELETE_RULE](state, idx) {
        state.ruleList = (state.ruleList || []).filter(r => r.id !== idx)
    },

    [types.UPDATE_VORLON](state, val) {
        state.vorlon = val
    }
}

export const actions = {
    setConfig({commit, state}, o) {
        commit(types.SET_CONFIG, o)
    },

    toggleEnableRule({commit, state}, v) {
        commit(types.TOGGLE_ENABLE_RULE, v)
    },

    toggleEnableHttps({commit, state}, v) {
        commit(types.TOGGLE_ENABLE_HTTPS, v)
    },

    addRule({commit, state}, rule) {
        commit(types.ADD_RULE, rule)
    },

    updateRule({commit, state}, rule) {
        commit(types.UPDATE_RULE, rule)
    },

    deleteRule({commit, state}, idx) {
        commit(types.DELETE_RULE, idx)
    },

    updateVorlon({commit}, val) {
        commit(types.UPDATE_VORLON, val)
    }
}
