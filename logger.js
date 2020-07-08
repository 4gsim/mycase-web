const Debug = require("debug");

module.exports = function Logger(scope) {
  return {
    debug: Debug("web-app:" + scope),
    error: Debug("web-app:error:" + scope),
    warn: Debug("web-app:warn:" + scope),
  };
};
