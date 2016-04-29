'use strict';

const _ = require('lodash');

module.exports = class Switch {
  constructor(dimension) {
    this.dimension = dimension;
    this.ρ = 0.75;
    this.inputs = [];

    for (let i = 0; i < dimension; i++) {
      this.inputs.push(_.fill(new Array(dimension), 0));
    }
  }

  randomPort() {
    return _.random(0, this.dimension - 1);
  }

  step() {
    // Arrival of one packet with probability ρ at each input port for random
    // output port (uniformly distributed)
    for (let i = 0; i < this.dimension; i++) {
      const arrival = Math.random();

      if (arrival <= this.ρ) {
        const input = this.randomPort(), output = this.randomPort();

        this.inputs[input][output] += 1;
      }
    }

    // Connect input ports to output ports randomly and serve each output if
    // there is a packet at its input's VOQ
    const map = _.shuffle(_.range(this.dimension));

    for (let i = 0; i < this.dimension; i++) {
      const input = this.inputs[i];
      const output = map[i];

      if (input[output] > 0) input[output] -= 1;
    }
  }
}
