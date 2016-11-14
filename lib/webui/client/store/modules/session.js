import * as types from 'store/mutation-types'
import util from 'util'

// initial state
const state = {
    sessions: {}
}

const mutations = {
    [types.ADD_SESSION] (state, newSession) {

        util.extend(state.sessions, newSession, true)

        state.sessions = Object.assign({}, state.sessions)
    },

    [types.DELETE_SESSION] (state) {

    }
}

export default {
    state,
    mutations
}
