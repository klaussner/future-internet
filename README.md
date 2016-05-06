# Future Internet

SS 2016 exercises

## Random permutation switch

The program *exercises/random-permutation.js* implements a simple 3x3 switch
that–in each simulation step–computes a random permutation of input/output port
connections and serves one packet per output if possible. In each step, every
input receives at most one incoming packet, based on a uniform arrival rate or
a traffic matrix.

### Usage

```
% cd exercises
% ./random-permutation.js [options]
```

`--mode=continuous|single` (default = `continuous`):  
In continuous mode, the simulation runs until it is interrupted (Ctrl-C) by the
user, whereas in single mode only one iteration is computed.

`--steps=<number>` (default = `1`):  
Number of simulation steps to compute per iteration.

`--colored`:  
Print each output port in a different color.

`--delay=<milliseconds>` (default = `1000`):  
Duration of the pause between two iterations.

`--arrival=<rate>` (default = `0.75`):  
Uniform arrival rate for each input port (between `0` and `1`).

`--traffic=<file>`:  
Path to a JSON file containing a 3x3 traffic matrix. This option overrides a
uniform arrival rate specified by `--arrival`.
