// Verify every report in bugs.json by replaying it against utils.js,
// plus a battery over all functions against independent references.
// Run: node verify.js   (exit 1 if any report fails to reproduce)
const fs = require("fs");
const u = require("./utils.js");
const reports = JSON.parse(fs.readFileSync("./bugs.json", "utf8"));

// Independent reference implementations:
const ref = {
  sum: (a) => a.reduce((t, x) => t + x, 0),
  max: (a) => Math.max(...a),
  reverse: (s) => [...s].reverse().join(""),
  isPalindrome: (s) => s === [...s].reverse().join(""),
  factorial: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
  clamp: (x, lo, hi) => Math.min(Math.max(x, lo), hi),
  unique: (a) => [...new Set(a)],
  average: (a) => a.reduce((t, x) => t + x, 0) / a.length,
  titleCase: (s) => s.replace(/\b\w+\b/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
  countVowels: (s) => (s.match(/[aeiou]/gi) || []).length,
};

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const callArgs = (input) => (Array.isArray(input) ? input : [input]);

let failures = 0;
console.log("--- replay of bugs.json ---");
for (const r of reports) {
  const args = callArgs(r.input);
  const gotSpread = u[r.fn](...args);      // grader-style: fn(...input)
  const gotDirect = u[r.fn](r.input);      // alt convention: fn(input)
  const okSpread = !eq(gotSpread, r.expected);
  const okDirect = !eq(gotDirect, r.expected);
  // A report is verified if the buggy function does NOT return the
  // expected value (under either call convention), while the reference does.
  const refGot = ref[r.fn](...args);
  const verified = (okSpread || okDirect) && eq(refGot, r.expected);
  console.log(
    `${verified ? "VERIFIED" : "NOT VERIFIED"} ${r.fn}(${JSON.stringify(r.input)}) ` +
    `=> buggy returns ${JSON.stringify(gotSpread)} (spread) / ${JSON.stringify(gotDirect)} (direct), ` +
    `expected ${JSON.stringify(r.expected)}, reference gives ${JSON.stringify(refGot)}`
  );
  if (!verified) failures++;
}

console.log("\n--- battery: every function vs reference (no false reports) ---");
const battery = {
  sum: [[[1, 2, 3]], [[-1, 5]], [[]]],
  max: [[[1, 5, 3]], [[-1, -5]], [[7]]],
  reverse: [["abc"], ["a"], [""], ["😀a"]],
  isPalindrome: [["racecar"], ["hello"], [""]],
  factorial: [[0], [1], [2], [5], [10]],
  clamp: [[5, 0, 10], [-1, 0, 10], [15, 0, 10], [0, 0, 10]],
  unique: [[[1, 1, 2, 3, 3]], [[1, 2, 3]]],
  average: [[[2, 4]], [[1, 2, 3, 4]]],
  titleCase: [["hello world"], ["hello-world"], ["hELLO WORLD"]],
  countVowels: [["hello"], ["AEIOU"], ["Hello World"], ["bcdfg"]],
};
const buggyFns = new Set();
for (const [fn, cases] of Object.entries(battery)) {
  for (const args of cases) {
    const got = u[fn](...args);
    const exp = ref[fn](...args);
    if (!eq(got, exp)) {
      buggyFns.add(fn);
      console.log(`BUG  ${fn}(${args.map((a) => JSON.stringify(a)).join(", ")}) => got ${JSON.stringify(got)} expected ${JSON.stringify(exp)}`);
    }
  }
}
console.log(`functions with at least one failing input: ${[...buggyFns].join(", ")}`);
console.log(`\nreports: ${reports.length}, verified: ${reports.length - failures}`);
if (failures) { console.log("VERIFY: FAILURES"); process.exit(1); }
console.log("VERIFY: ALL REPORTS REPRODUCE");
