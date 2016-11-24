import * as types from 'store/mutation-types'

// initial state
const state = {
    sessions: {}
}

const mutations = {
    [types.ADD_SESSION] (state, newSession) {

        state.sessions = Object.assign({}, state.sessions, newSession)
    }
}

export default {
    state,
    mutations
}
