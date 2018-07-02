import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import _concat from 'lodash/concat';
import _isArray from 'lodash/isArray';
import _mergeWith from 'lodash/mergeWith';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

dotenv.load();

const isProduction = process.env.NODE_ENV === 'production';

const mergeAppendArray = (...args) => _mergeWith(
    ...args,
    (current, next) => (
        _isArray(current) && _isArray(next)
            ? _concat(current, next)
            : undefined
    )
);

const productionConfig = {
    devtool: '#source-map',

    output: {
        publicPath: process.env.PUBLIC_PATH
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new CleanWebpackPlugin(['dist'])
    ]
};

const baseConfig = {
    mode: process.env.NODE_ENV,

    entry: [
        // './resources/js/index.js',
        './resources/scss/index.scss'
    ],

    output: {
        path: __dirname + '/dist',
        filename: 'bundle-[hash:5].js'
    },

    module: {
        rules: [
            {
                test: /\.hbs$/,
                loader: "handlebars-loader",
                query: {
                    inlineRequires: '\/assets\/',
                    helperDirs: path.resolve(__dirname, './helpers')
                }
            },
            {
                test: /\.scss$/,
                use: [
                    // fallback to style-loader in development
                    !isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            // {
            //     test: /\.js$/,
            //     use: 'babel-loader',
            //     exclude: /node_modules/
            // },
            {
                test: /\.(png|jpg|ico|mp4|ttf|woff|woff2|eot|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]?[hash]',
                        outputPath: 'assets/'
                    }
                }
            }
        ]
    },

    resolve: {
        alias: {
            '~': path.resolve(__dirname),
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Work at Viblo',
            template: 'index.hbs',
            favicon: './assets/favicon.ico',
            googleAnalytics: {
                trackingId: process.env.GOOGLE_ANALYTICS_TRACK_ID
            }
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: process.env.NODE_ENV,
            APP_URL: ''
        })
    ],

    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true,
        host: 'localhost',
        port: 1234
    }
};

export default isProduction
    ? mergeAppendArray(baseConfig, productionConfig)
    : baseConfig;
