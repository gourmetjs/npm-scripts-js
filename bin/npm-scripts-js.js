#!/usr/bin/env node

"use strict";

var npath = require("path");

var cmd = process.env.npm_lifecycle_event;
var def = require(npath.join(process.cwd(), "npm_scripts.js"));

if (!cmd)
  throw Error("You should run this script through package.json");

if (typeof def[cmd] !== "function")
  throw Error("No command handler is defined in npm_scripts: " + cmd);

var nsh = require("../lib/context")(def);

var res = def[cmd].call(def, nsh);

if (res instanceof Promise) {
  res.catch(function(err) {
    // Use setImmediate() to escape from Promise sandbox
    setImmediate(function() {
      throw err;
    });
  });
}
