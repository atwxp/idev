import * as types from 'store/mutation-types'

const state = {
    sessionObj: {}
}

const getters = {
    sessionList: state => {
        return Object.keys(state.sessionObj).map((idx) => {
            return state.sessionObj[idx]
        })
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

    [types.CLEAR_SESSION] (state) {
        state.sessionObj = {}
    }
}

const actions = {
    addSession ({commit}, newSession) {
        commit(types.ADD_SESSION, newSession)
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
