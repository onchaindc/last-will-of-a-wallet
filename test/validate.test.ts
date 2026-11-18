// The seed phrase, hex key and WIF below are publicly published documentation examples, not real wallets.
import assert from "node:assert/strict";
import { sample, validateWill, type WillData } from "../src/data";

const clone = (): WillData => JSON.parse(JSON.stringify(sample));

validateWill(sample); // the sample must pass

const seed = clone();
seed.assets[0].recovery = "witch collapse practice feed shame open despair creek road again ice least";
assert.throws(() => validateWill(seed), /recovery phrase/);

const hex = clone();
hex.note = "key 4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318 done";
assert.throws(() => validateWill(hex), /private key/);

const wif = clone();
wif.assets[1].address = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ";
assert.throws(() => validateWill(wif), /private key/);

const shares = clone();
shares.heirs[0].sharePct = 60;
assert.throws(() => validateWill(shares), /100%/);

console.log("validate.test.ts: all checks passed");
