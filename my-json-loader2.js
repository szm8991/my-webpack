module.exports = function jsonLoader(source) {
  console.log('loader2');
  return `export default ${JSON.stringify(source)}`;
};
