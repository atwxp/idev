import * as types from './mutation-types'

export const addSession = ({commit}, sessions) => {
    commit(types.ADD_SESSION, sessions)
}

export const deleteSession = ({commit}) => {
    commit(types.DELETE_SESSION)
}

export const updateActiveSession = ({commit}, session) => {
    commit(types.SET_ACTIVE_SESSION, session)
}
