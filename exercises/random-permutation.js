#!/usr/bin/env node
'use strict';

const Switch = require('../shared/Switch.js');

const _ = require('lodash');
const readline = require('readline');
require('colors');
const fs = require('fs');

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

function outputQueues(swtch, firstRun) {
  let total = 0;

  if (! firstRun) {
    readline.moveCursor(std, 0, -(swtch.dimension + 1));
  }

  // Print all virtual output queues of each input in one line, plus the total
  // number of packets in the input queue
  _.forEach(swtch.inputs, function(input) {
    const queueTotal = input.reduce((prev, cur) => prev + cur, 0);

    total += queueTotal;
    readline.clearLine(std, 0);

    std.write(input.map(function(output, i) {
      const cell = _.truncate(_.padStart(output, 3), {
        length: 3,
        omission: '…'
      });

      return argv.colored ? cell[colors[i % colors.length]] : cell;
    }).join(' '));

    std.write(`  (Σ = ${queueTotal})\n`);
  });

  readline.clearLine(std, 0);
  std.write(`Σ = ${total}\n`);
}

// Load and validate traffic matrix if specified
let arrival;

if ('traffic' in argv) {
  arrival = JSON.parse(fs.readFileSync(argv.traffic, 'utf-8'));

  try {
    if (arrival.length != 3) throw null;

    for (let i = 0; i < 3; i++) {
      if (arrival[i].length != 3) throw null;

      let rowSum = 0, colSum = 0;

      for (let j = 0; j < 3; j++) {
        rowSum += arrival[i][j];
        colSum += arrival[j][i];
      }

      if (rowSum > 1 || colSum > 1) throw null;
    }
  } catch (e) {
    console.error('Invalid traffic matrix');
    process.exit(1);
  }
} else {
  arrival = argv.arrival;
}

// Run the simulation once or continuously until the user exits

const swtch = new Switch(3, arrival);

function simulate() {
  _(argv.steps).times(() => swtch.step());
}

if (argv.mode == 'single') {
  simulate();
  outputQueues(swtch, true);

  process.exit();
} else if(argv.mode == 'continuous') {
  outputQueues(swtch, true);

  setInterval(function() {
    simulate();
    outputQueues(swtch);
  }, argv.delay);

  std.on('SIGINT', () => process.exit());
} else {
  console.error('Unknown mode');
  process.exit(1);
}
