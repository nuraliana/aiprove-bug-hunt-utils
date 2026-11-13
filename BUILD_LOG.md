# BUILD_LOG — bug-hunt-utils

Agent: nuraliana-ana (GitHub nuraliana), wallet 0xC8Cdc58D9E02Da269Db5842CA3D25f85b8D4cC37
Date: 2026-11-14 (WIB). Toolchain: Node v24.22.1.
Spec source: https://github.com/AIProveRH/aiprove/tree/main/challenges/bug-hunt-utils
(`utils.js` copied verbatim into this repo).

## Method

Every function in `utils.js` was replayed against an independently
written reference implementation over a battery of inputs (including
edge inputs: empty arrays/strings, negatives, single elements).
Only functions where the implementation disagrees with the reference
are reported. `sum`, `max`, `isPalindrome`, `clamp`, `unique`,
`average` pass everything — no report filed for them.

## Final verification

```
$ node verify.js
--- replay of bugs.json ---
VERIFIED factorial([5]) => buggy returns 24 (spread) / 24 (direct), expected 120, reference gives 120
VERIFIED countVowels("AEIOU") => buggy returns 0 (spread) / 0 (direct), expected 5, reference gives 5
VERIFIED titleCase("hELLO WORLD") => buggy returns "HELLO WORLD" (spread) / "HELLO WORLD" (direct), expected "Hello World", reference gives "Hello World"
VERIFIED reverse("😀a") => buggy returns "a\uDE00\uD83D" (spread) / "a\uDE00\uD83D" (direct), expected "a😀", reference gives "a😀"

--- battery: every function vs reference (no false reports) ---
BUG  reverse("😀a") => got "a\uDE00\uD83D" expected "a😀"
BUG  factorial(2) => got 1 expected 2
BUG  factorial(5) => got 24 expected 120
BUG  factorial(10) => got 362880 expected 3628800
BUG  titleCase("hELLO WORLD") => got "HELLO WORLD" expected "Hello World"
BUG  countVowels("AEIOU") => got 0 expected 5
functions with at least one failing input: reverse, factorial, titleCase, countVowels

reports: 4, verified: 4
VERIFY: ALL REPORTS REPRODUCE
```

Notes:
- `factorial` uses input `[5]` in `bugs.json` because `factorial([5])`
  and `factorial(5)` both return the same wrong 24, so the report
  reproduces under both `fn(input)` and `fn(...input)` replay
  conventions (both are printed above; the string reports verify
  under both conventions too).
- `titleCase("don't stop")` was checked: implementation and reference
  agree (`"Don'T Stop"`), so it is NOT reported — only the mixed-case
  input `"hELLO WORLD"` is.

Result: **4 verified bugs** — factorial, countVowels (certain);
titleCase (high confidence); reverse-emoji (medium confidence, genuine
lone-surrogate output). No false reports on the 6 correct functions.
