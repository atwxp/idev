var webpack = require('webpack');
var config = require('./webpack.config.js');
var webpackDevServer = require('webpack-dev-server');

config.entry.unshift('webpack-dev-server/client?http://localhost:8080/');

var compiler = webpack(config);

module.exports = function () {
    new webpackDevServer(compiler, {
        contentBase: 'client/',

        // publicPath: '/static/',

        // terminal config
        quiet: false,
        noInfo: false,
        stats: {
            colors: true
        }
    }).listen(8080, function () {
        console.log('Bundling project, please wait...');
    });
};
