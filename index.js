const webpack = require('./lib/webpack');
const options = require('./webpack.config');
const compiler = new webpack(options);
Object.keys(compiler.hooks).forEach(hookName => {
  if (compiler.hooks[hookName].tap) {
    compiler.hooks[hookName].tap('anyString', () => {
      console.log(`run -> ${hookName}`);
    });
  }
});
compiler.run();
