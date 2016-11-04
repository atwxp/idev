import * as types from '../mutation-types'

// initial state
const state = {
    sessions: [],

    activeSession: {}
}

const mutations = {
    [types.ADD_SESSION] (state, newSession) {
        state.sessions = state.sessions.concat(newSession)
    },

    [types.DELETE_SESSION] (state) {
        state.sessions.$remove(state.activeSession)
    },

    [types.SET_ACTIVE_SESSION] (state, session) {
        state.activeSession = session
    }
}

export default {
  state,
  mutations
}
