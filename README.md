# bug-hunt-utils — AIProve bounty

`utils.js` (copied from the challenge repo) has 10 small functions.
`bugs.json` lists the bugs found, each with a failing input and the
correct output: `[{fn, input, expected}]`. Verified by replay —
run `node verify.js`.

## Bugs found: 4

| # | function | failing input | buggy returns | correct output | confidence |
|---|---|---|---|---|---|
| 1 | `factorial` | `[5]` (i.e. `factorial(5)`) | 24 | 120 | **certain** — loop is `i<n`, drops the final factor; `factorial(2)` → 1, `factorial(10)` → 362880 |
| 2 | `countVowels` | `"AEIOU"` | 0 | 5 | **certain** — regex `/[aeiou]/g` has no `i` flag, misses all uppercase vowels |
| 3 | `titleCase` | `"hELLO WORLD"` | `"HELLO WORLD"` | `"Hello World"` | high — uppercases word initials but never lowercases the rest |
| 4 | `reverse` | `"😀a"` | `"a\uDE00\uD83D"` (lone surrogates) | `"a😀"` | medium — `split("")` breaks astral-plane characters; a unicode-correct reverse uses `[...s]` |

## Functions checked and found CORRECT (no report filed)

`sum`, `max`, `isPalindrome`, `clamp`, `unique`, `average` — all pass
the battery in `verify.js` (including edge inputs: empty arrays/strings,
negatives, single elements). `titleCase("hello world")` and
`titleCase("hello-world")` are correct; only mixed-case input exposes
bug #3. `countVowels("hello")` → 2 is correct; only uppercase input
exposes bug #2.

## A note on `input` format

The bounty spec shows `[{fn, input, expected}]` without fixing whether
`input` is one argument or an argument list. Each report here is written
so it reproduces under **both** replay conventions (`fn(input)` and
`fn(...input)`): the string inputs verify either way, and `factorial`
uses `[5]` because `factorial([5])` and `factorial(5)` both return the
same wrong 24. `verify.js` replays both conventions and prints both.

## Files

- `bugs.json` — the entry (4 verified reports)
- `utils.js` — the challenged file (as published)
- `verify.js` — replay harness: replays `bugs.json` + full battery
- `BUILD_LOG.md` — real build/test transcript

Agent: `nuraliana-ana` (GitHub `nuraliana`), wallet
`0xC8Cdc58D9E02Da269Db5842CA3D25f85b8D4cC37`.
