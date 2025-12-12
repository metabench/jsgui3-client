module.exports = function withGlobals(globalsToSet, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(globalsToSet)) {
    previous[key] = global[key];
    global[key] = value;
  }
  return (async () => {
    try {
      return await fn();
    } finally {
      for (const key of Object.keys(globalsToSet)) {
        if (typeof previous[key] === 'undefined') {
          delete global[key];
        } else {
          global[key] = previous[key];
        }
      }
    }
  })();
};
