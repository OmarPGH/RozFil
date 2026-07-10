# 🎯 RozFil
### ⚡ Advanced JavaScript Filter Library for Arrays & Objects

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1--beta.1-blue?style=flat-square)
![License](https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square)
![Language](https://img.shields.io/badge/language-JavaScript%20ES%20Module-yellow?style=flat-square)
![Status](https://img.shields.io/badge/status-Work%20In%20Progress-orange?style=flat-square)

**🚀 High-performance filtering with zero compromises on speed or memory**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Performance](#-performance--optimization)

</div>

---

## 📌 Overview

**RozFil** is a lightweight, blazingly-fast JavaScript library built for intelligent filtering of large arrays and objects. Designed with performance-critical applications in mind, it leverages **functional programming principles** to deliver memory-efficient solutions without the overhead of traditional OOP patterns.

Whether you're handling massive datasets or need precise type-safe filtering, RozFil provides the tools you need with minimal footprint.

---

## ⭐ Features

### 🏗️ **Functional Architecture**
- Pure, side-effect-free functions using return-based logic
- Zero constructor overhead or complex OOP abstraction
- Clean, composable API design

### 💾 **Memory Optimized**
- Built from the ground up to prevent memory leaks
- Smart allocation strategies for large-scale datasets
- Minimal garbage collection pressure
- Zero unnecessary array allocations

### 📦 **Modular Design**
- Native ES Modules (`import`/`export`)
- Clean, organized file structure with intelligent indexing
- Tree-shakeable exports for minimal bundle size
- Easy to integrate into modern JavaScript projects

### 🔒 **Strict Type Safety**
- Robust type detection for arrays and objects
- Reliable handling of edge cases (NaN, Infinity, Symbols, BigInt, etc.)
- Predictable behavior across different data types

### 🎯 **Smart Filtering**
- Multiple filtering strategies for different use cases
- `fbType` - Filter by type detection
- `fbExType` - Filter by exact type matching
- `fbTypeSmart` - Intelligent filtering with advanced logic
- `fbVal` - Filter by exact value matching
- `fbIncludeVal` - Filter by value inclusion

---

## 📥 Installation

### Clone & Use
```bash
git clone https://github.com/OmarPGH/RozFil.git
cd RozFil
```

### Direct Import
```javascript
import { arrUtils, objUtils } from './src/index.js';
```

### NPM (Coming Soon)
```bash
npm install rozfil
```

---

## 🚀 Usage

### Basic Array Filtering

```javascript
import { arrUtils } from './src/index.js';

const data = [
  '', 
  '   ', 
  Infinity, 
  'Infinity', 
  Symbol('id'), 
  9999999999999n, 
  '9999999999999n', 
  1, 
  '2', 
  true, 
  'true', 
  false, 
  'false', 
  undefined, 
  'undefined', 
  NaN, 
  'NaN', 
  null, 
  'null', 
  'Mohamed'
];

// Filter using smart type detection
const filtered = arrUtils.fbTypeSmart(
  data, 
  undefined, 
  null, 
  NaN, 
  'arr', 
  'str', 
  'str'
);

console.log(filtered); // ✨ Filtered results
```

### Available Filter Methods

#### `fbType(array, ...types)`
Filter array by type - flexible type matching

#### `fbExType(array, ...types)`
Filter array by exact type - strict matching only

#### `fbTypeSmart(array, ...types)`
Intelligent filtering with advanced logic for complex scenarios

#### `fbVal(array, value)`
Filter array by value matching

#### `fbIncludeVal(array, value)`
Filter array by value inclusion

---

## 📊 Performance & Optimization

RozFil is engineered from the ground up for performance:

| Feature | Benefit |
|---------|---------|
| **In-place Tracking** | Minimizes heap allocations during sequential filtering passes |
| **Lazy Evaluation** | Processes data on-demand without unnecessary intermediate arrays |
| **GC Friendly** | Ensures cached references are properly cleared immediately after execution |
| **Zero Overhead** | No wrapper objects or unnecessary abstractions |
| **Optimized Loops** | Tight, efficient iteration patterns for maximum throughput |

### Real-World Performance
```javascript
// Processing 5M+ items efficiently
let largeArray = [...]; // millions of items
let result = arrUtils.fbTypeSmart(largeArray, undefined, null, NaN);
// ⚡ Completes in milliseconds with minimal memory overhead
```

---

## 🏗️ Project Structure

```
RozFil/
├── src/
│   ├── index.js                    # Main entry point
│   ├── arrUtils/
│   │   ├── index.js               # Array utilities export
│   │   ├── filterByType.js        # Type-based filtering
│   │   ├── filterByExactType.js   # Strict type filtering
│   │   ├── filterByTypeSmart.js   # Advanced filtering logic
│   │   ├── filterByValue.js       # Value-based filtering
│   │   ├── filterByIncludeValue.js # Inclusion filtering
│   │   ├── translator.js          # Type translation utilities
│   │   └── regexBook.js           # Regex patterns library
│   └── objUtils/
│       ├── index.js               # Object utilities export
│       ├── filterByType.js        # Object type filtering
│       ├── translator.js          # Type translation
│       └── regexBook.js           # Regex patterns
├── package.json                    # Project metadata
├── test.js                         # Performance testing suite
└── README.md                       # This file
```

---

## 🔧 API Reference

### Array Utils (`arrUtils`)

| Method | Description | Signature |
|--------|-------------|-----------|
| `fbType()` | Filter by type | `fbType(array, ...types)` |
| `fbExType()` | Filter by exact type | `fbExType(array, ...types)` |
| `fbTypeSmart()` | Smart filtering | `fbTypeSmart(array, ...types)` |
| `fbVal()` | Filter by value | `fbVal(array, value)` |
| `fbIncludeVal()` | Filter by inclusion | `fbIncludeVal(array, value)` |
| `translate()` | Type translation | `translate(value)` |
| `reBook` | Regex patterns | `reBook.{pattern}` |

### Object Utils (`objUtils`)
🚧 **Currently In Development**

---

## 📝 Examples

### Filter Strings from Mixed Array
```javascript
import { arrUtils } from './src/index.js';

const mixed = [1, 'hello', 2, 'world', 3, true, 'test'];
const strings = arrUtils.fbType(mixed, 'string');
// Result: ['hello', 'world', 'test']
```

### Remove Null and Undefined
```javascript
const data = [1, null, 2, undefined, 3, 'text', null];
const clean = arrUtils.fbTypeSmart(data, null, undefined);
// Result: [1, 2, 3, 'text']
```

### Handle Edge Cases
```javascript
const complex = [NaN, Infinity, -Infinity, 'text', 123, null];
const numeric = arrUtils.fbType(complex, 'number');
// Intelligent handling of NaN and Infinity
```

---

## 🎓 Use Cases

- ✅ **Data Cleaning**: Remove invalid or unwanted entries from datasets
- ✅ **Type Safety**: Ensure only specific types in your collections
- ✅ **Performance**: Process millions of items efficiently
- ✅ **Data Transformation**: Prepare data for analysis or processing
- ✅ **Testing**: Validate and filter test data
- ✅ **Real-time Processing**: Handle streaming data with minimal overhead

---

## 📌 Current Status

| Component | Status |
|-----------|--------|
| Array Utils | ✅ **Ready** |
| Object Utils | 🚧 **In Development** |
| Documentation | ✅ **Complete** |
| Tests | 🚧 **In Progress** |
| Performance Benchmarks | 📊 **Planned** |

---

## 🤝 Contributing

Contributions are welcome! Whether you have ideas for optimization, new features, or bug fixes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the LICENSE file for details.

---

## 👨‍💻 Author

**Omar Gamal** - Creator & Maintainer

---

## 🙏 Acknowledgments

- Inspired by functional programming best practices
- Built with performance and memory efficiency as core principles
- Community feedback and contributions

---

## 📞 Support & Feedback

Found a bug? Have a suggestion? 
- Open an issue on GitHub
- Reach out with your feedback

---

<div align="center">

### ⭐ If you find RozFil useful, please consider giving it a star!

**Made with ❤️ for the JavaScript community**

</div>