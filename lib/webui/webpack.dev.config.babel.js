import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';
import webpackConfig from './webpack.config.babel';

const port = process.env.PORT || 8080;

const compiler = webpack(webpackConfig);

webpackConfig.entry.index.unshift('webpack-dev-server/client?http://localhost:' + port + '/');

export default function () {
    new webpackDevServer(compiler, {
        contentBase: 'client',

        // publicPath: '/static/',

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
