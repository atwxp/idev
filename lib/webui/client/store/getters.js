export const allSession = state => {
    let sessions = state.session.sessions;

    let keys = Object.keys(sessions);

    return keys.map((idx) => {
        return sessions[idx];
    });
}
