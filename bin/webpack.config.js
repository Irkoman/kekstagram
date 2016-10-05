'use strict';


const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const OUTPUT_DIRNAME = path.resolve(projectRoot, 'build');
const SRC_DIRNAME = path.resolve(projectRoot, 'src');


const getJSFiles = (dir) => {
  try {
    let files = fs.readdirSync(dir, 'utf-8');
    let output = {};

    files.forEach((filename) => {
      output[filename.replace(/\.js$/, '')] = path.resolve(dir, filename);
    });

    return output;
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
};


module.exports = {
  devServer: {
    contentBase: OUTPUT_DIRNAME,
    entryPath: SRC_DIRNAME
  },

  devtool: 'sourcemap',

  entry: getJSFiles(path.resolve(SRC_DIRNAME, 'js')),

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
