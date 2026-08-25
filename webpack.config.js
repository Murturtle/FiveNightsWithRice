const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',

    entry: './src/index.ts',

    devtool: false,

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        pathinfo: false,
    },

    optimization: {
        minimize: true,

        minimizer: [
            new TerserPlugin({
                extractComments: false,

                terserOptions: {
                    compress: {
                        passes: 3,
                        booleans_as_integers: true,
                        comparisons: true,
                        conditionals: true,
                        dead_code: true,
                        evaluate: true,
                        loops: true,
                        sequences: true,
                        switches: true,
                        unused: true,
                    },

                    mangle: true,

                    format: {
                        comments: false,
                        beautify: false,
                    },
                },
            }),
        ],

        usedExports: true,
        sideEffects: true,

        concatenateModules: true,

        splitChunks: false,
        runtimeChunk: false,

        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/offline.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true,
            },
        }),

        new HtmlInlineScriptPlugin(),
    ],
};