"use strict";

var npath = require("path");
var assign = require("object-assign");
var shell = require("./shell");
var spawn = require("./spawn");

module.exports = function context(def) {
  function _getEnv() {
    function _findCase(key) {
      var lkey = key.toLowerCase();
      for (var name in process.env) {
        if (name.toLowerCase() === lkey)
          return name;
      }
      return key;
    }

    var env = {};
    var res = {};
    var key, val;

    if (baseEnv === undefined) {
      baseEnv = def.__env;
      if (typeof baseEnv === "function")
        baseEnv = baseEnv.call(def, nsh);
      baseEnv = baseEnv || {};
    }

    assign(env, baseEnv);
    assign(env, userEnv);

    for (key in env) {
      val = env[key];
      if (Array.isArray(val))
        val = val.join(npath.delimiter);
      // On Windows, setting "PATH" doesn't work because "Path" is expected by
      // the system. We try to keep the key's case if it exists already in
      // `process.env` as a general solution to this problem.
      if (process.platform === "win32" && process.env[key])
        key = _findCase(key);
      res[key] = val;
    }

    return assign({}, process.env, res);
  }

  var argv = process.argv.slice(2);
  var debugFlag = def.__debugFlag === false ? null : (def.__debugFlag || "--debug");
  var baseEnv = undefined;
  var userEnv = {};
  var finalEnv;
  var nodeExec;

  if (debugFlag && argv[0] === debugFlag) {
    argv.shift();
    nodeExec = "node-debug";
  } else {
    nodeExec = "node";
  }

  var nsh = {
    node: function(command, options) {
      var exec = (options && options.ignoreDebug) ? "node" : nodeExec;
      return nsh.shell(exec + " " + command, options);
    },

    spawn: function(exec, args, options) {
      args = args || [];
      if (typeof args === "string")
        args = args.split(/\s/);
      if (argv.length)
        args = args.concat(argv);
      return spawn(exec, args, assign({env: nsh.env()}, options));
    },

    shell: function(command, options) {
      if (argv.length)
        command += " " + argv.join(" ");
      return shell(command, assign({env: nsh.env()}, options));
    },

    env: function(env) {
      if (env) {  // set
        assign(userEnv, env);
        finalEnv = undefined;
      } else {    // get
        if (!finalEnv)
          finalEnv = _getEnv();
        return finalEnv;
      }
    }
  };

  return nsh;
};
