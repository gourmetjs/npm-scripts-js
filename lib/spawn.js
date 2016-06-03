"use strict";

var assign = require("object-assign");
var nspawn = require("child_process").spawn;

// Returns a promise that is resolved with an exit code when the shell command
// terminates. Promise is rejected if the shell command could not be executed
// due to an error or the child process exits with an error code and
// `ignoreError` is falsy.
function spawn(exec, args, options) {
  args = args || [];
  options = options || {};

  var sopts = {
    cwd: options.cwd,
    env: options.env,
    stdio: "inherit"
  };

  // You can override the global `spawn.ignoreError` option.
  var ignore = (options.ignoreError !== undefined ? options.ignoreError : spawn.ignoreError);

  if (!options.silent)
    console.log(exec, args.join(" "));

  if (process.platform === "win32" && options.windowsVerbatimArguments)
    sopts.windowsVerbatimArguments = true;

  var child = nspawn(exec, args, sopts);

  var p = new Promise(function(resolve, reject) {
    child.on("exit", function(code) {
      if (code && !ignore)
        reject(Error("Process " + child.pid + " exited with code " + code));
      else
        resolve(code);
    }).on("error", function(err) {
      reject(err);
    });
  });

  p._childProcess = child;

  return p;
}

// Global option
spawn.ignoreError = false;

module.exports = spawn;
