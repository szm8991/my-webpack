module.exports = class TxtWebpackPlugin {
  //传入编译器
  apply(compiler) {
    console.log('tap event');
    compiler.hooks.emit.tap('mywebpackplugin', context => {
      context.change();
    });
  }
};
