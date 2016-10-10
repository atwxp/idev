/**
 * @file   util tool
 * @author wxp201013@163.com
 */

function gid() {
    return 'xxxx'.replace(/x/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
}

function clone(obj) {
    let ret = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                ret[key] = clone(obj[key]);
            }
            else {
                ret[key] = obj[key];
            }
        }
    }

    return ret;
}

function extend(target, source, alone) {
    target = alone ? clone(target) : target;

    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }

    return target;
}

/* eslint-disable */
function trim(str) {
    return str.replace(/^(\s|\u00A0|　)+|(\s|\u00A0|　)+$/g, '');
}
/* eslint-enable */

export default {
    gid,
    clone,
    extend,
    trim
};
