var path = require('path')
var webpack = require('webpack')

module.exports = {
    debug: true,
    watch: true,
    devtool: 'eval',

    entry: './Rtc.jsx',

    output: {
        path: __dirname + '/dist',
        publicPath: './dist',
        filename: 'Rtc.js'
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
