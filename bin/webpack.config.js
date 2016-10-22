'use strict';


const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const OUTPUT_DIRNAME = path.resolve(projectRoot, 'build');
const SRC_DIRNAME = path.resolve(projectRoot, 'src');


module.exports = {
  devServer: {
    contentBase: OUTPUT_DIRNAME,
    entryPath: SRC_DIRNAME
  },

  devtool: 'sourcemap',

  entry: path.resolve(SRC_DIRNAME, 'js/main.js'),

  output: {
    filename: 'js/[name].js',
    outputPath: '/',
    path: OUTPUT_DIRNAME,
    sourceMapFilename: "[file].map?dropcache"
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: `${SRC_DIRNAME}`, to: `${OUTPUT_DIRNAME}` }
    ], {
      ignore: [`${SRC_DIRNAME}/js`]
    })
  ]
};
