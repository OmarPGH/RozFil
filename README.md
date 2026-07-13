# 🎯 RozFil
### ⚡ Intelligent JavaScript Utility Library for Arrays & Objects

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1--beta.1-blue?style=flat-square)
![License](https://img.shields.io/badge/license-LGPL--3.0--only-green?style=flat-square)
![Language](https://img.shields.io/badge/language-JavaScript%20ES%20Module-yellow?style=flat-square)
![Status](https://img.shields.io/badge/status-Work%20In%20Progress-orange?style=flat-square)

**🚀 Smart, precise type-detection and exclusion filtering for data cleaning**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Performance](#-performance--optimization)

</div>

---

## 📌 Overview

**RozFil** is a lightweight, precise JavaScript utility library built to solve one of JS's biggest headaches: data cleaning and type identification. Instead of writing messy, repetitive conditional loops, RozFil allows you to seamlessly **exclude and filter out** unwanted data types, exact values, or even stringified data structures from your collections.

Whether you're handling dirty datasets or need strict type-safe exclusion, RozFil provides predictable tools without unnecessary library overhead.

---

## ⭐ Features

### 🏗️ **Functional Architecture**
- Pure, predictable logic with zero global state side-effects
- Lightweight footprint with zero third-party dependencies
- Clean, composable API design

### 🔍 **Smart Type Detection**
- Fixes traditional `typeof` limitations (correctly distinguishes between Arrays and Objects)
- Reliable handling of JS edge cases (NaN, Infinity, etc.)
- Predictable behavior across different native data types

### 🧩 **Stringified Data Parsing**
- Intelligent detection for text-wrapped structures
- Able to detect `'[]'`, `'{}'`, or `'1'` as their actual semantic types

### 📦 **Modular Design**
- Native ES Modules (`import`/`export`)
- Clean, organized file structure with intelligent indexing
- Easy to integrate into modern JavaScript projects

### 🎯 **Smart Exclusion Filtering (arrUtils)**
- Multiple exclusion strategies for arrays
- `arrUtils.fbType` - Exclude by basic JS type
- `arrUtils.fbExType` - Exclude by exact type matching (differentiates NaN from numbers)
- `arrUtils.fbTypeSmart` - Intelligent exclusion including stringified types
- `arrUtils.fbVal` - Exclude by exact value
- `arrUtils.fbIncludeVal` - Exclude by value inclusion

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

> 💡 **IMPORTANT NOTE:** RozFil filters operate on an **exclusion** basis. The types or values you pass to the functions are the ones that will be **removed** from your array.

### Basic Array Filtering (arrUtils)

```javascript
import { arrUtils } from './src/index.js';

const data = [
  1, 
  'hello', 
  NaN, 
  [], 
  '[]', 
  '123', 
  undefined, 
  null
];

// params : [inPlace, arr, ...input]

// 1. Standard exclusion (Removes basic JS types)
const noNumbers = arrUtils.fbType(false, data, 'number'); (Note: false to clone the array instead of edit it)
// Result: ['hello', [], '[]', '123', undefined, null] (Note: NaN is technically a 'number' in JS!)

// 2. Exact type exclusion (Differentiates NaN from numbers, Arrays from Objects)
const strictClean = arrUtils.fbExType(false, data, 'NaN', 'arr');
// Result: [1, 'hello', '[]', '123', undefined, null]

// 3. Smart type exclusion (Detects types inside strings!)
const smartClean = arrUtils.fbTypeSmart(false, data, 'arr', 'num');
// Result: ['hello', NaN, undefined, null] (Removed both native arrays / numbers and '[]' / '123' strings)
```

---

## 📊 Performance & Optimization

RozFil is engineered to be lightweight and reliable for everyday data manipulation:

| Feature | Benefit |
| :--- | :--- |
| **Native Execution** | Relies on standard, optimized JavaScript loops |
| **Predictable Flow** | Processes data directly without complex abstractions |
| **Zero Dependencies** | Ensures your node_modules stays clean and secure |
| **Lightweight** | No heavy wrapper objects or unnecessary overhead |
| **Strict Type Safety** | Prevents runtime errors caused by unexpected data types |

---

## 🏗️ Project Structure

```
RozFil/
├── src/
│   ├── index.js                    # Main entry point
│   ├── arrUtils/                   # Array utilities module
│   │   ├── index.js               
│   │   ├── filterByType.js        # Basic type-exclusion
│   │   ├── filterByExactType.js   # Strict type exclusion
│   │   ├── filterByTypeSmart.js   # Advanced exclusion (stringified types)
│   │   ├── filterByValue.js       # Exact value exclusion
│   │   ├── filterByIncludeValue.js # Value inclusion exclusion
│   │   ├── translator.js          # Type translation utilities
│   │   └── regexBook.js           # Regex patterns library
│   └── objUtils/                   # Object utilities module (WIP)
│       ├── index.js               
│       ├── filterByType.js        
│       ├── translator.js          
│       └── regexBook.js           
├── package.json                    
├── test.js                         
└── README.md                       
```

---

## 🔧 API Reference

### Array Utils (arrUtils)

| Method | Description | Signature |
| :--- | :--- | :--- |
| arrUtils.fbType() | Excludes items matching basic JS types | arrUtils.fbType(array, ...types) |
| arrUtils.fbExType() | Excludes items matching exact types | arrUtils.fbExType(array, ...types) |
| arrUtils.fbTypeSmart() | Excludes items using smart string detection | arrUtils.fbTypeSmart(array, ...types) |
| arrUtils.fbVal() | Excludes matching exact values | arrUtils.fbVal(array, value) |
| arrUtils.fbIncludeVal() | Excludes items containing the value | arrUtils.fbIncludeVal(array, value) |
| arrUtils.translate() | Type translation utility | arrUtils.translate(value) |
| arrUtils.reBook | Regex patterns dictionary | arrUtils.reBook.{pattern} |

### Object Utils (objUtils)

🚧 **Currently In Development**

---

## 🎓 Use Cases

- ✅ **Data Cleaning**: Remove invalid, unwanted, or corrupted entries from datasets.
- ✅ **Type Safety**: Ensure only clean, specific types remain in your collections.
- ✅ **API Response Handling**: Strip out null, undefined, or stringified empty objects received from backend APIs.
- ✅ **Form Validation**: Clean up mixed user inputs effortlessly.

---

## 📌 Current Status

| Component | Status |
| :--- | :--- |
| Array Utils (arrUtils) | ✅ **Ready** |
| Object Utils (objUtils) | 🚧 **In Development** |
| Documentation | ✅ **Complete** |
| Tests | 🚧 **In Progress** |

---

## 🤝 Contributing

Contributions are welcome! Whether you have ideas for new exact types, optimizing the regex books, or fixing bugs:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU Lesser General Public License v3.0 only / LGPL-3.0-only License** - see the LICENSE file for details.

---

## 👨‍💻 Author

**Omar Gamal** - Creator & Maintainer

---

## 🙏 Acknowledgments

- Built to make JavaScript type-checking actually make sense.
- Community feedback and contributions.

---

## 📞 Support & Feedback

Found a bug? Have a suggestion for a new smart type?

- Open an issue on GitHub
- Reach out with your feedback

---

<div align="center">

### ⭐ If you find RozFil useful, please consider giving it a star!

**Made with ❤️ for the JavaScript community**

</div>
