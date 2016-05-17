#!/usr/bin/env node
'use strict';

const strategies = require('../shared/scheduling-strategies.js');

const _ = require('lodash');
const fs = require('fs');

const argv = require('minimist')(process.argv.slice(2), {
  default: {
    strategy: 'gps',
    quantum: 200
  }
});

// Read trace file and store each packet arrival in an event queue

if (! argv._[0]) {
  console.error('Missing trace file');
  process.exit(1);
}

const traceRaw = fs.readFileSync(argv._[0], 'utf-8')
  .split('\n')
  .filter(function(line) {
    return line && ! line.startsWith('#');
  });

const flowCount = parseInt(traceRaw[0]);
const events = [];

for (let i = 1; i < traceRaw.length; i++) {
  const p = traceRaw[i].split(/\s+/);

  events.push({
    flow: parseInt(p[0]),
    size: parseInt(p[1]),
    arrival: parseInt(p[2])
  });
}

// Simulate packet arrival and processing until the event queue is empty

const queues = [];
const latencies = [];
let µs = 0;
let current = -1;

_.times(flowCount, function() {
  const queue = [];

  queue.served = 0;
  queues.push(queue);

  latencies.push([]);
});

while (true) {
  while (events.length > 0 && µs >= events[0].arrival) {
    const event = events.shift();
    queues[event.flow].push(event);
  }

  if (queues.some(q => q.length > 0)) {
    const strategy = strategies[argv.strategy];

    do {
      current = (current + 1) % flowCount;
    } while (queues[current].length == 0);

    µs = strategy(queues[current], µs, latencies[current], argv);
  } else if (events.length > 0) {
    µs = events[0].arrival;
  } else {
    break;
  }
}

// Calculate and print throughput, mean latency, and latency standard deviation
// in total and for each flow individually

let totalMbps = 0, totalMean, totalSd, totalLatencies;

function stdDev(values, mean) {
  let sd = 0;

  for (let value of values) {
    const Δ = value - mean;
    sd += Δ * Δ;
  }

  return Math.sqrt(sd / values.length);
}

function stats(mbps, mean, sd) {
  mbps = mbps.toFixed(4);
  mean = (mean / 1000).toFixed(4);
  sd = (sd / 1000).toFixed(4);

  return `${mbps} Mbit/s, μ=${mean} ms, s=${sd} ms`;
}

console.log('Flows:');

queues.forEach(function(queue, flow) {
  const mean = _.mean(latencies[flow]);
  let mbps = queue.served / µs;
  let sd = 0;

  totalMbps += mbps;
  sd = stdDev(latencies[flow], mean);

  console.log(`  ${flow}: ${stats(mbps, mean, sd)}`);
});

console.log('Total:');

totalLatencies = _.flatten(latencies);
totalMean = _.mean(totalLatencies);
totalSd = stdDev(totalLatencies, totalMean);

console.log(`  ${stats(totalMbps, totalMean, totalSd)}`);
