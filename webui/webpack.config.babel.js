'use strict'

import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const abs = (...values) => {
    let p = [__dirname].concat(values);

    return path.resolve.apply(null, p);
};

const isProduction = process.env.NODE_ENV === 'production';

const srcPath = abs('client');

const outputPath = abs('output');

const assetsPath = isProduction ? '' : '/static/';

export default {
    context: srcPath,

    entry: {
        index: ['./index.js']
    },

    output: {
        path: outputPath,

        filename: 'static/[name].js',

        publicPath: '/',

        sourceMapFilename: '[file].map'
    },

    devtool: isProduction ? null : 'source-map',

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
                loader: 'style!css'
            },

            {
                test: /\.less$/,
                loader: 'style!css!less'
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
            },

            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ],

        noParse: /\.min\.js/
    },

    // https://github.com/vuejs-templates/webpack/tree/master/template/build
    vue: {
        loaders: {
            css: ExtractTextPlugin.extract('vue-style', 'css'),
            less: ExtractTextPlugin.extract('vue-style', 'css!less')
        }
    },

    plugins: (function () {
        return (isProduction
            ? [
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                }),

                new webpack.BannerPlugin('(c) ' + new Date().getFullYear() + ' wxp. All Rights Reserved')
            ]
            : []
            )
            .concat([
                new ExtractTextPlugin('static/[name].css'),

                new HtmlWebpackPlugin({
                    template: 'index.html'
                })
            ]);
    })(),

    // https://github.com/vuejs/vue/wiki/Vue-2.0-RC-Starter-Resources
    resolve: {
        root: srcPath,

        alias: {
            vue: 'vue/dist/vue.js'
        },

        extensions: ['', '.vue', '.js']
    }
};
