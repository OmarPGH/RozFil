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
  - `cs` *(boolean)*: Case sensitivity flag for string comparisons. Default: `true`.
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
│       ├── regexBook.js             # Regular expressions repository
│       ├── translator.js            # Type alias translator
│       └── invalid.js               # Fallback markers
├── tests/                           # Test scripts
│   ├── arrUtilsTest.js
│   └── objUtilsTest.js
├── package.json
├── LICENSE
└── README.md
```

---

## Testing

Run test execution scripts using Node.js:

```bash
node tests/arrUtilsTest.js
node tests/objUtilsTest.js
```

---

## License

This project is licensed under the **GNU Lesser General Public License v3.0 only (LGPL-3.0-only)**. See the LICENSE file for details.

---

## Author

**Omar Gamal** - Creator and Maintainer
