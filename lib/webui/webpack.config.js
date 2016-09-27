'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var abs = function () {
    var p = [__dirname].concat(Array.prototype.slice.call(arguments));

    return path.join.apply(null, p);
};

module.exports = {
    context: abs('client'),

    entry: ['./index.js'],

    output: {
        path: abs('output'),

        filename: 'index.js'
    },

    devtool: 'source-map',

    module: {
        preLoaders: [
            // {
            //     test: /\.js$/,
            //     loader: 'fecs-loader',
            //     exclude: /node_modules/
            // }
        ],

        loaders: [
            {
                test: /\.html$/,
                loader: 'html'
            },

            {
                test: /\.css$/,
                loader: 'style!css?sourceMap'
            },

            {
                test: /\.less$/,
                loader: 'style!css?sourceMap!less?sourceMap'
            },

            {
                test: /\.(png|jpe?g|gif)$/,
                loader: 'url',
                query: {
                    // inline files smaller then 10kb as base64 dataURL
                    limit: 10000,
                    // fallback to file-loader with this naming scheme
                    name: '[name].[ext]?[hash]'
                }
            },

            {
                test: /\.(eot|woff|woff2|ttf|svg)([a-z0-9\?#]+)?$/,
                loader: 'file-loader'
            },

            {
                test: /\.vue$/,
                loader: 'vue'
            },

            {
                test: /\.json$/,
                loader: 'json'
            }
        ],

        noParse: /\.min\.js/
    },

    // @see: http://vuejs.github.io/vue-loader/configurations/extract-css.html
    vue: {
        loaders: {
            css: 'css',
            less: 'css!less'
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            inject: false
        })
    ],

    resolve: {
        extensions: ['', '.vue', '.js']
    }
};
