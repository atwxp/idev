var util = require('./util');
var pkgConf = require('../package.json');

var config = module.exports = util.extend({}, pkgConf);
config.host = '127.0.0.1';
config.uipath = './webui/app';

config.extend = function (options) {
    util.extend(config, options);

    var port = config.port;

    pkgConf.ports.forEach(function (name) {
        config[name] = ++port;
    });
};
