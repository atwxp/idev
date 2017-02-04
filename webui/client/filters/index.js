/**
 * @file   vue filter
 * @author wxp201013@163.com
 */

import {capitalize, camelCase} from 'util'

export default function (vue) {
    vue.filter('capitalize', capitalize)

    vue.filter('camelCase', function (...string) {
        return camelCase.apply(null, string)
    })
}
