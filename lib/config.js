import pkgConf from '../package.json';

let config = Object.assign({}, pkgConf);

config.extend = function (options) {
    Object.assign(config, options);

    let port = config.port;

    pkgConf.ports.forEach((name) => {
        config[name] = ++port;
    });
};

export default config;
