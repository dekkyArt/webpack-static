const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyWebpackPlugin = require('html-beautify-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestWebpackPlugin = require('webpack-manifest-plugin');
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const svgoConfig = {
    removeXMLNS: true,
};

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        const parts = item.split('.');
        const name = parts[0];
        const extension = parts[1];

        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
            svgoConfig,
        });
    });
}

module.exports = {
    entry: {
        app: path.resolve(__dirname, './src/js/app.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: devMode ? 'js/[name].js' : 'js/[name].[hash].js',
        chunkFilename: devMode ? 'js/[name].[id].js' : 'js/[name].[id].[hash].js',
        publicPath: '/',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, './src/js'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },

            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: devMode,
                            reloadAll: devMode,
                        },
                    },
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'postcss-loader', options: { sourceMap: true } },
                    { loader: 'sass-loader', options: { sourceMap: true } },
                ],
            },

            { test: /\.pug$/, loader: 'pug-loader' },

            {
                test: /\.(eot|ttf|woff|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            context: 'src',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new CleanWebpackPlugin(),
        new ManifestWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? 'css/[name].css' : 'css/[name].[hash].css',
            chunkFilename: devMode ? 'css/[id].css' : 'css/[id].[hash].css',
        }),
        ...generateHtmlPlugins('./src/html/views'),
        new HtmlBeautifyWebpackPlugin({
            config: {
                html: {
                    preserve_newlines: false,
                },
            },
        }),
        new HtmlWebpackInlineSVGPlugin({
            runPreEmit: true,
        }),
    ],
    optimization: {
        splitChunks: {
            minSize: 1000,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all',
                    priority: -10,
                    reuseExistingChunk: true,
                    filename: devMode ? 'js/[name].bundle.js' : 'js/[name].[hash].bundle.js',
                },
            },
        },
        minimizer: [
            new TerserWebpackPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
            }),
            new OptimizeCssAssetsWebpackPlugin(),
        ],
    },
};
