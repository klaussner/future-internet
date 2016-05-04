#!/usr/bin/env node
'use strict';

const Switch = require('../shared/Switch.js');

const argv = require('minimist')(process.argv.slice(2));

if ('matrix' in argv) {
  // TODO: Load traffic matrix
}

const s = new Switch(3);
