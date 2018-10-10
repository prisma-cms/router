

require('@babel/polyfill');

require('@babel/register')({
  extensions: ['.js'],
  "presets": [
    "@babel/preset-env",
  ],
  "plugins": [
    "transform-es2015-modules-commonjs",
    "@babel/plugin-proposal-class-properties"
  ],
});

const chalk = require("chalk");

const Module = require("../src").default;

new Module()

console.log(chalk.green("Tests passed"));