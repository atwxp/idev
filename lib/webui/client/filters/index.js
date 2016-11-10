import util from 'util'

export default function (vue) {
    vue.filter('capitalize', util.capitalize)

    vue.filter('camelCase', function () {
        return util.camelCase.apply(null, arguments)
    });
};
