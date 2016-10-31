import * as types from '../mutation-types'

// initial state
const state = {
    sessions: [],

    activeSession: {}
}

const mutations = {
    [types.ADD_SESSION] (state) {
        const newSession = {}

        state.sessions.push(newSession)
    },

    [types.DELETE_SESSION] (state) {
        state.sessions.$remove(state.activeSession)
    },

    [types.REPLAY_SESSION] (state) {

    },

    [types.SET_ACTIVE_SESSION] (state, session) {
        state.activeSession = session
    }
}

export default {
  state,
  mutations
}
