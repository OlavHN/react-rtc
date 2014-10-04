var path = require('path')
var webpack = require('webpack')

module.exports = {
    debug: true,
    watch: true,
    devtool: 'eval',

    entry: './src/Demo.jsx',

    output: {
        path: __dirname + '/build',
        publicPath: './build',
        filename: 'Demo.js'
    },

    module: {
        loaders: [
            { test: /\.jsx$/, loader: 'jsx' }
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx']
    },

    plugins: [
        new webpack.IgnorePlugin(/vertx/)
    ]
};
