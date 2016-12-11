import * as types from 'store/mutation-types'

// initial state
const state = {
    sessions: {}
}

const mutations = {
    [types.ADD_SESSION] (state, newSession) {
        Object.keys(newSession).forEach((k) => {
            state.sessions[k] = Object.assign({}, state.sessions[k] || {}, newSession[k])
        });

        state.sessions = Object.assign({}, state.sessions)
    }
}

export default {
    state,
    mutations
}
