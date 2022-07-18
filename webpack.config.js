const path = require('path');
const jsonLoader2 = require('./my-json-loader2');
const myPlugin = require('./my-plugin');
module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [
          {
            loader: jsonLoader2,
          },
          {
            loader: './my-json-loader1.js',
          },
        ],
      },
    ],
  },
  plugins: [new myPlugin()],
};
