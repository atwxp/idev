import lib from './lib';
import config from './lib/config';

export default function (options) {
    config.extend(options);

    lib.start();
};
