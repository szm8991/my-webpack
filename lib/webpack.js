const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const { transformFromAst } = require('@babel/core');
const traverse = require('@babel/traverse').default;
const { SyncHook } = require('tapable');
module.exports = class webpack {
  constructor(options) {
    const {
      entry,
      output,
      module: { rules },
      plugins,
    } = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
    // loader相关
    this.loaders = rules;
    this.loaderContext = {
      addDeps() {
        console.log('add deps');
      },
    };
    // plugin相关
    this.hooks = {
      emit: new SyncHook(['pluginContext']),
    };
    this.pluginContext = {
      change() {
        console.log('change');
      },
    };
    plugins.forEach(plugin => {
      plugin.apply(this);
    });
  }
  run() {
    const entryModule = this.parse(this.entry);
    this.modules.push(entryModule);
    //外层for循环遍历所有模块——类似层序遍历
    for (let i = 0; i < this.modules.length; i++) {
      const item = this.modules[i];
      const { dependency } = item;
      //内层for循环添加模块供外层循环再遍历
      for (const key of Object.keys(dependency)) {
        //去重，解决相互依赖
        const flag = this.modules.filter(item => item.entryFile === dependency[key]);
        if (flag.length != 0) continue;
        else this.modules.push(this.parse(dependency[key]));
      }
    }
    // console.log(this.modules);
    const obj = {};
    this.modules.forEach(item => {
      obj[item.entryFile] = {
        dependency: item.dependency,
        code: item.code,
      };
    });
    // console.log(obj);
    this.file(obj);
  }
  parse(entryFile) {
    //分析依赖，处理得到依赖项
    let content = fs.readFileSync(entryFile, 'utf-8');
    this.hooks.emit.call(this.pluginContext);
    //使用loader处理
    this.loaders.forEach(({ test, use }) => {
      if (test.test(entryFile)) {
        if (Array.isArray(use)) {
          for (let i = use.length - 1; i >= 0; i--) {
            if (typeof use[i].loader == 'function') {
              content = use[i].loader.call(this.loaderContext, content);
            } else if (typeof use[i].loader == 'string') {
              const loader = require(use[i].loader);
              content = loader.call(this.loaderContext, content);
            }
          }
        }
      }
    });
    this.hooks.emit.call(this.pluginContext);
    const ast = parser.parse(content, { sourceType: 'module' });
    const dirname = path.dirname(entryFile);
    const dependency = {};
    traverse(ast, {
      ImportDeclaration: function ({ node }) {
        let newPathName = './' + path.join(dirname, node.source.value);
        newPathName = newPathName.replaceAll('\\', '/');
        dependency[node.source.value] = newPathName;
      },
    });
    // console.log(dependency);
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env'],
    });
    // console.log(code);
    return {
      entryFile,
      dependency,
      code,
    };
  }
  file(code) {
    this.hooks.emit.call(this.pluginContext);
    //根据output生成bundle文件
    const filePath = path.join(this.output.path, this.output.filename);
    const bundle = `(function (modules) {
        function require(module) {
            function pathRequire(path) {
                return require(modules[module].dependency[path]);
            }
            const exports={};
            (function(require,exports,code){
                eval(code);
            })(pathRequire,exports,modules[module].code)
            return exports;
        }
        require('${this.entry}');
})(${JSON.stringify(code)})`;
    fs.writeFileSync(filePath, bundle, 'utf-8');
  }
};
