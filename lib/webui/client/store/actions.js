import * as types from './mutation-types'

export const addSession = ({commit}) => {
    commit(types.ADD_SESSION)
}

export const deleteSession = ({commit}) => {
    commit(types.DELETE_SESSION)
}

export const updateActiveSession = ({commit}, note) => {
    commit(types.SET_ACTIVE_SESSION, note)
}

export const replaySession = ({commit}) => {
    commit(types.REPLAY_SESSION)
}
