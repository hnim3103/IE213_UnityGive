// top5_hash.circom
// Computes a Poseidon hash of the top-5 donor addresses (as field elements)
// Use this off-chain to produce a compact fingerprint of top-5 donors that can
// then be signed by donors (sign message: chainId|contractAddress|campaignId|milestoneIndex|hash).

pragma circom 2.0.0;

include "circomlib/poseidon.circom";

template Top5Hash() {
    signal input a;
    signal input b;
    signal input c;
    signal input d;
    signal input e;
    signal output out;

    component p = Poseidon(5);
    p.inputs[0] <== a;
    p.inputs[1] <== b;
    p.inputs[2] <== c;
    p.inputs[3] <== d;
    p.inputs[4] <== e;
    out <== p.out;
}

component main = Top5Hash();
