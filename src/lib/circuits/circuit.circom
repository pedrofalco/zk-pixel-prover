pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/pedersen.circom";

template Hasher(){
    signal input secret;
    signal output out;

    // Add a constraint that the secret must be 12345
    secret === 12345;

    component pedersen = Pedersen(1);
    pedersen.in[0] <== secret;
    out <== pedersen.out[0];
}

component main = Hasher();