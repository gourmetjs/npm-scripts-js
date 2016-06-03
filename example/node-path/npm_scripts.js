"use strict";

module.exports = {
  __env: function() {
    return {
      NODE_PATH: [
        "vendor",
        "local"
      ]
    };
  },
  start: function(nsh) {
    return nsh.node("lib/hello.js");
  }
};
