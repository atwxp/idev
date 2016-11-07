import * as types from 'store/mutation-types'
import util from 'util'

// initial state
const state = {
    sessions: {},

    activeSession: {}
}

const mutations = {
    [types.ADD_SESSION] (state, newSession) {
        util.extend(state.sessions, newSession, true);

        state.sessions = Object.assign({}, state.sessions);
    },

    [types.DELETE_SESSION] (state) {
        // state.sessions.$remove(state.activeSession)
    },

    [types.SET_ACTIVE_SESSION] (state, session) {
        // state.activeSession = session
    }
}

export default {
    state,
    mutations
}
