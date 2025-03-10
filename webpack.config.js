const path = require('path');

module.exports = {
  mode: 'production',
  entry: './public/js/game.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/dist')
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}; 