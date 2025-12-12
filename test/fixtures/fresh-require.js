const path = require('node:path');

module.exports = function freshRequire(modulePath, { baseDir = process.cwd() } = {}) {
  const absolutePath = path.isAbsolute(modulePath) ? modulePath : path.resolve(baseDir, modulePath);
  const resolved = require.resolve(absolutePath);
  delete require.cache[resolved];
  return require(resolved);
};
