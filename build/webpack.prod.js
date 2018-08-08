'use strict';

const path = require('path');
const webpack = require('webpack');

const {VueLoaderPlugin} = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: [
        './src/app.js'
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.js$/,
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, '..', 'index.html'),
            template: path.resolve(__dirname, '../src', 'index.html'),
            inject: true
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '..', 'dist')
    }
};