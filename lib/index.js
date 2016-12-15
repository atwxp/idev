import proxy from './proxy'
import config from './config'

export default function (options) {
    config.extend(options)

    proxy.start()
};
