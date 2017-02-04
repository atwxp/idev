/**
 * @file   session data
 * @author wxp201013@163.com
 */

import * as types from 'store/mutation-types'

export const state = {
    sessionObj: {},

    activeId: -1
}

export const getters = {
    sessionList(state) {
        return Object.keys(state.sessionObj).map(idx => state.sessionObj[idx])
    },

    activeSession(state) {
        return state.sessionObj[state.activeId]
    }
}

export const mutations = {
    [types.ADD_SESSION](state, newSession = {}) {
        Object.keys(newSession).forEach(k => {
            if (state.sessionObj[k]) {
                state.sessionObj[k] = {...state.sessionObj[k], ...newSession[k]}
                delete newSession[k]
            }
        })

        state.sessionObj = {...state.sessionObj, ...newSession}
    },

    [types.SET_ACTIVE_SESSION_ID](state, id) {
        state.activeId = id
    },

    [types.CLEAR_SESSION](state) {
        state.sessionObj = {}

        state.activeId = -1
    }
}

export const actions = {
    addSession({commit}, newSession) {
        commit(types.ADD_SESSION, newSession)
    },

    setActiveSessionId({commit}, id) {
        commit(types.SET_ACTIVE_SESSION_ID, id)
    },

    clearSession({commit}) {
        commit(types.CLEAR_SESSION)
    }
}
