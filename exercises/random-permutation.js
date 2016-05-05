#!/usr/bin/env node
'use strict';

const Switch = require('../shared/Switch.js');

const _ = require('lodash');
const readline = require('readline');

const argv = require('minimist')(process.argv.slice(2), {
  default: {
    mode: 'single',
    steps: 1
  }
});

const std = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function outputQueues(s, firstRun) {
  if (! firstRun) {
    readline.moveCursor(std, 0, -s.dimension);
  }

  // Print all virtual output queues of each input in one line, plus the total
  // number of packets in the input queue
  _.forEachRight(s.inputs, function(input) {
    const total = input.reduce((prev, cur) => prev + cur, 0);

    readline.clearLine(std, 0);

    std.write(input.map(function(output, i) {
      return _.padStart(output, 3);
    }).join(' '));

    std.write(`  (Σ = ${total})\n`);
  });
}

if ('matrix' in argv) {
  // TODO: Load traffic matrix
}

const s = new Switch(3);

outputQueues(s, true);

if (argv.mode == 'single') {
  _(argv.steps).times(() => s.step());
  outputQueues(s);
}

std.close();
