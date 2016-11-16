import proxy from './lib/proxy'
import config from './lib/config'

export default function (options) {
    config.extend(options)

    proxy.start()
};
