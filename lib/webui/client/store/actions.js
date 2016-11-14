import * as types from './mutation-types'

export const addSession = ({commit}, sessions) => {
    commit(types.ADD_SESSION, sessions)
}

export const deleteSession = ({commit}) => {
    commit(types.DELETE_SESSION)
}

