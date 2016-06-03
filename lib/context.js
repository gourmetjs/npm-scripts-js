"use strict";

var npath = require("path");
var assign = require("object-assign");
var shell = require("./shell");
var spawn = require("./spawn");

module.exports = function context(def) {
  var argv = process.argv.slice(2);
  var debugFlag = def.__debugFlag === false ? null : (def.__debugFlag || "--debug");
  var nodeExec;

  if (debugFlag && argv[0] === debugFlag) {
    argv.shift();
    nodeExec = "node-debug";
  } else {
    nodeExec = "node";
  }

  var _context = {
    node: function(command, options) {
      var exec = (options && options.ignoreDebug) ? "node" : nodeExec;
      return _context.shell(exec + " " + command, options);
    },

    spawn: function(exec, args, options) {
      args = args || [];
      if (typeof args === "string")
        args = args.split(/\s/);
      if (argv.length)
        args = args.concat(argv);
      return spawn(exec, args, assign({env: _context.env}, options));
    },

    shell: function(command, options) {
      if (argv.length)
        command += " " + argv.join(" ");
      return shell(command, assign({env: _context.env}, options));
    }
  };

  _context.env = (function() {
    function _findCase(key) {
      var lkey = key.toLowerCase();
      for (var name in process.env) {
        if (name.toLowerCase() === lkey)
          return name;
      }
      return key;
    }

    var env = def.__env || {};
    var res = {};
    var key, val;

    if (typeof env === "function")
      env = env.call(def, context);

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
  })();

  return _context;
};
