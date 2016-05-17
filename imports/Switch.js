'use strict';

const _ = require('lodash');

module.exports = class Switch {
  constructor(dimension, arrival) {
    this.dimension = dimension;
    this.λ = arrival;
    this.inputs = [];

    for (let i = 0; i < dimension; i++) {
      this.inputs.push(_.fill(new Array(dimension), 0));
    }
  }

  step() {
    // Arrival of at most one packet at each input port with probability
    // λ/dimension (uniform) or λ[input][output] (from traffic matrix) for each
    // output port
    for (let i = 0; i < this.dimension; i++) {
      let arrival = Math.random();

      if (_.isArray(this.λ)) {
        const row = this.λ[i];
        let output = -1;

        for (let j = 0; j < this.dimension && output < 0; j++) {
          const p = row[j];

          if (arrival <= p) {
            output = j;
          } else {
            arrival -= p;
          }
        }

        if (output > -1) {
          this.inputs[i][output] += 1;
        }
      } else {
        if (arrival <= this.λ) {
          const output = _.random(0, this.dimension - 1);

          this.inputs[i][output] += 1;
        }
      }
    }

    // Connect input ports to output ports randomly and serve each output if
    // there is a packet at its input's virtual output queue
    const map = _.shuffle(_.range(this.dimension));

    for (let i = 0; i < this.dimension; i++) {
      const input = this.inputs[i];
      const output = map[i];

      if (input[output] > 0) input[output] -= 1;
    }
  }
}
