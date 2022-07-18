module.exports = function jsonLoader(source) {
  console.log('loader1');
  this.addDeps();
  return `export default ${JSON.stringify(source)}`;
};
