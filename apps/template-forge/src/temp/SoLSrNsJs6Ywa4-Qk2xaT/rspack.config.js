const path = require('path');

module.exports = {
  context: '__dirname',
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg)$/,
        type: 'asset/resource',
      },
    ],
  },
  builtins: {
    html: [
      {
        template: './index.html',
      },
    ],
  },
};
