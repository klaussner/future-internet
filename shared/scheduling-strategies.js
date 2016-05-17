'use strict';

const _ = require('lodash');

module.exports = {
  // Generalized processor sharing (GPS)
  gps(queue, µs, latencies) {
    const packet = queue[0];

    µs++;
    queue.served++;

    if (_.isUndefined(packet.pending)) {
      packet.pending = packet.size;
    }

    if (--packet.pending == 0) {
      queue.shift();
      latencies.push(µs - packet.arrival);
    }

    return µs;
  },

  // Packet-based round robin
  rr(queue, µs, latencies) {
    const packet = queue[0];

    µs += packet.size;
    queue.served += packet.size;

    queue.shift();
    latencies.push(µs - packet.arrival);

    return µs;
  },

  // Deficit round robin
  drr(queue, µs, latencies, argv) {
    queue.deficit = queue.deficit || 0;
    queue.deficit += argv.quantum;

    let packet = queue[0];

    while (packet && queue.deficit >= packet.size) {
      µs += packet.size;

      queue.served += packet.size;
      queue.deficit -= packet.size;
      queue.shift();

      latencies.push(µs - packet.arrival);

      packet = queue[0];
    }

    if (queue.length == 0) {
      queue.deficit = 0;
    }

    return µs;
  }
};
