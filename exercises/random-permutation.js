#!/usr/bin/env node
'use strict';

const Switch = require('../shared/Switch.js');

const _ = require('lodash');
const readline = require('readline');
require('colors');

const argv = require('minimist')(process.argv.slice(2), {
  default: {
    mode: 'continuous',
    steps: 1,
    colored: false,
    delay: 1000,
    arrival: 0.75
  },
  boolean: ['colored']
});

const std = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = ['green', 'blue', 'yellow'];

function outputQueues(s, firstRun) {
  let total = 0;

  if (! firstRun) {
    readline.moveCursor(std, 0, -(s.dimension + 1));
  }

  // Print all virtual output queues of each input in one line, plus the total
  // number of packets in the input queue
  _.forEachRight(s.inputs, function(input) {
    const queueTotal = input.reduce((prev, cur) => prev + cur, 0);

    total += queueTotal;
    readline.clearLine(std, 0);

    std.write(input.map(function(output, i) {
      const cell = _.padStart(output, 3);

      return argv.colored ? cell[colors[i % colors.length]] : cell;
    }).join(' '));

    std.write(`  (Σ = ${queueTotal})\n`);
  });

  std.write(`Σ = ${total}\n`);
}

if ('matrix' in argv) {
  // TODO: Load traffic matrix
}

const s = new Switch(3, argv.arrival);

function simulate() {
  _(argv.steps).times(() => s.step());
}

// Run the simulation once or continuously until the user exits
if (argv.mode == 'single') {
  simulate();
  outputQueues(s, true);

  process.exit();
} else if(argv.mode == 'continuous') {
  outputQueues(s, true);

  setInterval(function() {
    simulate();
    outputQueues(s);
  }, argv.delay);

  std.on('SIGINT', () => process.exit());
} else {
  console.error('Unknown mode');
  process.exit(1);
}
