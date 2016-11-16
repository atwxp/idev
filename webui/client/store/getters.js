import util from 'util'

export const allSession = state => {
    let sessions = state.session.sessions;

    let keys = Object.keys(sessions);

    return keys.map((idx) => {
        let s = sessions[idx]

        s.cls = [util.getContentType(s.contentType) || '', util.getStatusType(s.status) || ''].join(' ');

        return s;
    });
}
