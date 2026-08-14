# RozFil

### Intelligent JavaScript Utility Library for Arrays and Objects

![Version](https://img.shields.io/badge/version-0.0.1--beta.1-blue)
![License](https://img.shields.io/badge/license-LGPL--3.0--only-green)
![Language](https://img.shields.io/badge/language-JavaScript%20ES%20Module-yellow)
![Status](https://img.shields.io/badge/status-Work%20In%20Progress-orange)

Lightweight, high-performance, and type-precise JavaScript utility library built for dataset cleaning and data exclusion across Arrays and Objects.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Supported Type Aliases](#supported-type-aliases)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [License](#license)

---

## Overview

RozFil simplifies data cleaning in JavaScript collections. Operating on an **exclusion model**, RozFil allows developers to target unwanted data types, exact values, or text-wrapped stringified data structures and filter them out seamlessly.

Instead of writing complex conditional loops, RozFil provides functional, depth-controlled utilities that handle edge cases (such as `NaN`, `Infinity`, `null`, `Array` vs `Object`, and stringified JSON) safely.

---

## Key Features

- **Functional Architecture**: Pure logic with zero external dependencies.
- **Dual Container Support**: Automatically routes and filters both Arrays and Objects.
- **Three-Level Type Rigor**:
  - Level 1: Standard JavaScript `typeof` checks.
  - Level 2: Strict primitive and native type differentiation (`NaN`, `Infinity`, `null`, `Date`, `Array`, `Object`).
  - Level 3: Smart stringified type detection (`'123'` as number, `'true'` as boolean, `'[1,2]'` as array, `'{a:1}'` as object).
- **Flexible Options**: Control recursion depth, in-place mutation, and case sensitivity.
- **Fast Array Compaction**: Implements O(N) two-pointer write compaction for high performance.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/OmarPGH/RozFil.git
cd RozFil
```

### Import in ES Modules

```javascript
import { fbType, fbVal } from './src/index.js';
```

---

## Quick Start

### 1. Filter by Type (`fbType`)

Exclude specific data types from an array or object:

```javascript
import { fbType } from './src/index.js';

const dataset = [
  10,
  'hello',
  NaN,
  [1, 2],
  '[1, 2]',
  '123',
  undefined,
  null
];

// Exclude native numbers and stringified numbers (rigor level 3)
const cleaned = fbType(dataset, ['num'], { rigor: 3 });
// Result: ['hello', NaN, [1, 2], '[1, 2]', undefined, null]

// Strict exclusion of NaN and Arrays (rigor level 2)
const strictClean = fbType(dataset, ['nan', 'arr'], { rigor: 2 });
// Result: [10, 'hello', '[1, 2]', '123', undefined, null]
```

### 2. Filter by Value (`fbVal`)

Exclude specific values from an array or nested object:

```javascript
import { fbVal } from './src/index.js';

const userData = {
  user1: { name: 'Omar', role: 'Admin' },
  user2: { name: 'Yuna', role: 'Guest' },
  user3: { name: 'Harry', role: 'admin' }
};

// Case-insensitive exclusion of 'admin' values across depth 2
const activeUsers = fbVal(userData, ['admin'], { cs: false, depth: 2 });
// Result removes matching property values regardless of casing
```

---

## API Reference

### `fbType(data, types, options)`

Excludes items from `data` based on type specifications.

- **`data`** *(Array | Object)*: Target collection to filter.
- **`types`** *(Array<string> | string)*: Type names or shorthand aliases to exclude.
- **`options`** *(Object)*: Configuration settings:
  - `rigor` *(number)*: Type detection precision level (1, 2, or 3). Default: `1`.
  - `depth` *(number)*: Traversal depth limit for nested structures. Default: `Infinity`.
  - `inPlace` *(boolean)*: Mutates the original object/array if `true`. Default: `false`.

### `fbVal(data, values, options)`

Excludes items from `data` that match specific values.

- **`data`** *(Array | Object)*: Target collection to filter.
- **`values`** *(Array | any)*: Values to match and remove.
- **`options`** *(Object)*: Configuration settings:
  - `cs` *(boolean)*: Case sensitivity flag for string comparisons. Set to `false` to match regardless of casing. Default: `true`.
  - `depth` *(number)*: Traversal depth limit for nested structures. Default: `Infinity`.
  - `inPlace` *(boolean)*: Mutates the original object/array if `true`. Default: `false`.

---

## Supported Type Aliases

RozFil supports shorthand type aliases for fast and clean filtering:

| Shorthand | Canonical Name | Description |
| :--- | :--- | :--- |
| `str` | `string` | String primitives |
| `num` | `number` | Numeric values |
| `bln` | `boolean` | Boolean values (`true` / `false`) |
| `uf` | `undefined` | Undefined values |
| `fun` | `function` | Functions |
| `nl` | `null` | Null values |
| `arr` | `array` | Native Arrays |
| `obj` | `object` | Plain Objects |
| `nan` | `NaN` | Not-a-Number values |
| `bi` | `bigint` | BigInt primitives |
| `ifty` | `Infinity` | Infinity numerical values |
| `smbl` | `symbol` | Symbol primitives |
| `tru` | `true` | Boolean true |
| `fls` | `false` | Boolean false |
| `emptystr` | `emptyString` | Empty strings (`""`) |
| `ss` | `emptyStringWithSpaces` | Whitespace-only strings |
| `ss?` | `emptyStringOrWithSpaces` | Empty or whitespace strings |
| `{s?}` | `emptyObject` | Empty objects (`{}`) |
| `[s?]` | `emptyArray` | Empty arrays (`[]`) |
| `date` | `date` | Parseable date strings |

---

## Project Structure

```
RozFil/
├── src/
│   ├── index.js                     # Main entry point
│   ├── typedefs.js                  # Shared JSDoc type definitions
│   ├── engines/                     # Filter execution engines
│   │   ├── index.js
│   │   ├── arrayFilterEngine.js     # Array processing engine
│   │   └── objectFilterEngine.js    # Object processing engine
│   ├── filters/                     # Filter implementations
│   │   ├── filterByType.js          # Type-exclusion logic
│   │   └── filterByValue.js         # Value-exclusion logic
│   └── shared/                      # Core helpers & algorithms
│       ├── index.js
│       ├── baseFilterEngine.js      # Core loops and array compaction
│       ├── filterEngineRouter.js    # Container type router
│       ├── isWalkable.js            # Nested object/array inspector
│       ├── jsonValidator.js         # Safe stringified-JSON detection
│       ├── regexBook.js             # Regular expressions repository
│       ├── translator.js            # Type alias translator
│       └── invalid.js               # Fallback markers
├── tests/                           # Test suite, mirroring src/
│   ├── regressions.test.js          # Guards against previously fixed bugs
│   ├── engines/
│   │   ├── arrayFilterEngine.test.js
│   │   └── objectFilterEngine.test.js
│   ├── filters/
│   │   ├── filterByType.test.js
│   │   └── filterByValue.test.js
│   └── shared/
│       ├── baseFilterEngine.test.js
│       ├── filterEngineRouter.test.js
│       ├── isWalkable.test.js
│       ├── jsonValidator.test.js
│       ├── regexBook.test.js
│       └── translator.test.js
├── benchmarks/                      # Performance measurement
│   ├── harness.js                   # Timing and scaling utilities
│   └── index.js                     # Benchmark suite
├── jsconfig.json                    # Editor IntelliSense configuration
├── package.json
├── LICENSE
└── README.md
```

---

## Editor Support

Every module carries JSDoc annotations, so hover tooltips, parameter hints and
auto-completion work out of the box in VS Code — no build step and no
TypeScript migration required. Shared object shapes (`FbTypeOptions`,
`FbValOptions`, `TypeAlias`, ...) live in `src/typedefs.js`.

To additionally have the editor type-check calls against those annotations, set
`checkJs` to `true` in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "checkJs": true
  }
}
```

---

## Testing

Tests run on the **native Node.js test runner** (`node:test` + `node:assert/strict`).
There are no third-party dependencies and no install step.

```bash
npm test
```

Or invoke the runner directly:

```bash
node --test tests/**/*.test.js
```

Test files mirror the `src/` layout, so the tests for a module live at the
matching path under `tests/`. Add new ones as `*.test.js` and they are picked
up automatically.

To run a single file while working on it:

```bash
node --test tests/filters/filterByType.test.js
```

A handful of checks are marked with `todo`. These document known gaps —
they report as `⚠` and describe the gap, but do not fail the run.

---

## Benchmarks

```bash
npm run bench
```

Zero dependencies, same as the tests. The suite doubles the input size
repeatedly and reports the **per-element cost** at each size. That is the
number to watch: work that is genuinely O(n) costs the same per element no
matter how large the input gets, so the drift from smallest to largest stays
near `1.00×`. Absolute timings vary by machine and are not worth comparing
across hosts.

The run exits non-zero if an asserted sweep turns super-linear, so it doubles
as a performance regression check.

Two results worth knowing:

- **Array compaction is linear**, holding flat at roughly 25–30 ns per element
  from 25,000 up to 800,000. This is the O(N) two-pointer claim under *Key
  Features*, and it holds.
- **Object filtering is not.** Repeated `delete` moves V8 out of its fast
  object representation into dictionary mode, so per-element cost climbs with
  size — around 2.7× across the same range. Nothing in RozFil can avoid that.
  Prefer arrays for very large collections.

Cloning costs roughly 5× the filtering itself, which is what `inPlace: true`
buys back when you can afford to mutate.

---

## License

This project is licensed under the **GNU Lesser General Public License v3.0 only (LGPL-3.0-only)**. See the LICENSE file for details.

---

## Author

**Omar Gamal** - Creator and Maintainer
