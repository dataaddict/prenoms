const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  // context: path.join(__dirname, 'src'),
  entry: {
    application: './src/application.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // vue-loader options go here
        }
      }, {
        test: /\.pug$/,
        loaders: 'pug-loader',
        exclude: /node_modules/
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }, {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
          publicPath: 'images/',
          outputPath: 'images/'
        }
      }, {
        test: /\.css$/,
        // loader: 'style-loader!css-loader?sourceMap'
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap'
        })
      }, {
        test: /\.styl$/,
        // loader: 'style-loader!css-loader?sourceMap'
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap!stylus-loader'
        })
      },
      // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader'
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    port: 8003,
    quiet: false,
    noInfo: false,
    hot: false,
    inline: false
  },
  // devtool: '#eval-source-map',
  plugins: [
    new ExtractTextPlugin('application.css'),
    new HtmlWebpackPlugin({ template: 'src/index.html', inject: false }),
    new CopyWebpackPlugin([
      { from: 'src/data.json' }
      // { context: 'src/fonts/',
      //   from: '*.{woff,woff2}',
      //   to: 'fonts'
      //   // from: 'src/fonts/*.{woff,woff2}', to: '/fonts/'
      // }
    ])
  ]
}

if (process.env.NODE_ENV === 'production') {
  // module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || [])
    .concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ])
}
