import webpack from 'webpack'
import webpackDevServer from 'webpack-dev-server'
import webpackConfig from './webpack.config.babel'

import config from '../lib/config'

export default function () {
    const port = config.webpackPort || 8080;

    webpackConfig.plugins.push(new webpack.DefinePlugin({
        UIPORT: JSON.stringify(config.uiport)
    }))

    const compiler = webpack(webpackConfig)

    webpackConfig.entry.index.unshift('webpack-dev-server/client?http://localhost:' + port + '/')

    new webpackDevServer(compiler, {
        contentBase: 'webui/output/',

        publicPath: '/',

        // terminal config
        quiet: false,
        noInfo: false,
        stats: {
            colors: true
        }
    }).listen(port, function () {
        console.log('Bundling project, please wait...');
    });
};
