import util from './util';
import pkgConf from '../package.json';

var config = util.extend({}, pkgConf);

config.extend = function (options) {
    util.extend(config, options);

    let port = config.port;

    pkgConf.ports.forEach((name) => {
        config[name] = ++port;
    });
};

export default config;
