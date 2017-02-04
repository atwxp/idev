/**
 * @file   webpack dev config entry
 * @author wxp201013@163.com
 */

import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

import webpackConfig from './webpack.config.babel'

import config from '../lib/config'

export default function () {
    const port = config.webpackPort || 8080;

    const compiler = webpack(webpackConfig)

    webpackConfig.entry.index.unshift('webpack-dev-server/client?http://localhost:' + port + '/')

    new WebpackDevServer(compiler, {
        contentBase: 'webui/output/',

        publicPath: '/',

        // terminal config
        quiet: false,
        noInfo: false,
        stats: {
            colors: true
        }
    }).listen(port, function () {
        console.log('Bundling project, please wait...')
    })
}
