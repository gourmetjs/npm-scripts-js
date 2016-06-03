"use strict";

var assign = require("object-assign");
var spawn = require("./spawn");

module.exports = function shell(command, options) {
  var sh, args;

  options = assign({}, options);

  if (process.platform === "win32") {
    sh = process.env.comspec || "cmd.exe";
    args = ["/s", "/c", '"' + command + '"'];
    options.windowsVerbatimArguments = true;
  } else {
    sh = "/bin/sh";
    args = ["-c", command];
  }

  return spawn(sh, args, options);
};
