import * as types from 'store/mutation-types'

import util from '../../util'

// initial state
const state = {
    sessionList: {}
}

const getters = {
    allSession: state => {
        let sessionList = state.sessionList

        return Object.keys(sessionList).map((idx) => {
            let s = sessionList[idx]

            s.cls = [
                util.getContentType(s.contentType) || '',
                util.getStatusType(s.status) || ''
            ].join(' ')

            return s
        })
    }
}

const mutations = {
    [types.ADD_SESSION] (state, newSession = {}) {

        Object.keys(newSession).forEach((k) => {
            if (state.sessionList[k]) {
                state.sessionList[k] = {...state.sessionList[k], ...newSession[k]}
                delete newSession[k]
            }
        })

        state.sessionList = {...state.sessionList, ...newSession}
    }
}

const actions = {
    addSession ({commit}, newSession) {
        commit(types.ADD_SESSION, newSession)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
