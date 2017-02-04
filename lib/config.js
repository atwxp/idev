/**
 * @file   proxy config file
 * @author wxp201013@163.com
 */

import path from 'path'

import {getHomeDir} from './util'

import pkgConf from '../package.json'

let config = Object.assign({}, pkgConf)

config.extend = function (options) {
    Object.assign(config, options)

    let port = config.port

    pkgConf.ports.forEach(name => {
        config[name] = ++port
    })

    config.dataDir = path.join(getHomeDir(), '.IdevData')
};

export default config
