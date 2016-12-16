import * as types from 'store/mutation-types'

const state = {
    sessionObj: {},

    activeId: -1
}

const getters = {
    sessionList: state => {
        return Object.keys(state.sessionObj).map((idx) => {
            return state.sessionObj[idx]
        })
    },

    activeSession: state => {
        return state.sessionObj[state.activeId]
    }
}

const mutations = {
    [types.ADD_SESSION] (state, newSession = {}) {
        Object.keys(newSession).forEach((k) => {
            if (state.sessionObj[k]) {
                state.sessionObj[k] = {...state.sessionObj[k], ...newSession[k]}
                delete newSession[k]
            }
        })

        state.sessionObj = {...state.sessionObj, ...newSession}
    },

    [types.SET_ACTIVE_SESSION_ID] (state, id) {
        state.activeId = id
    },

    [types.CLEAR_SESSION] (state) {
        state.sessionObj = {}

        state.activeId = -1
    }
}

const actions = {
    addSession ({commit}, newSession) {
        commit(types.ADD_SESSION, newSession)
    },

    setActiveSessionId ({commit}, id) {
        commit(types.SET_ACTIVE_SESSION_ID, id)
    },

    clearSession ({commit}) {
        commit(types.CLEAR_SESSION)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
