const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

const path = require('path');
const { env } = require('process');
const outputPath = 'dist';
const entryPoints = {
    main: [
        path.resolve(__dirname, 'src', 'main.ts'),
        path.resolve(__dirname, 'scss', 'main.scss')
    ],
    background: {
      import: path.resolve(__dirname, 'src', 'background.ts'),
      dependOn: 'detection_service'
    },
    detection_service: path.resolve(__dirname, 'src', 'services', 'detection_service.ts')
};

module.exports = {
    entry: entryPoints,
    output: {
        path: path.join(__dirname, outputPath),
        filename: '[name].bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(sa|sc)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
                use: 'url-loader?limit=1024'
            }
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
              { from: '.', to: '.', context: 'public' },
              { from: '.', to: './assets', context: 'assets' },
            ]
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new Dotenv(),
    ]
};
