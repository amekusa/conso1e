**conso1e** ( conso[one]e ) is a fully functional `console` wrapper with additional features. Since it wraps every `console` method, you can simply replace `console` with it.

[![Build Status](https://travis-ci.org/amekusa/conso1e.svg?branch=master)](https://travis-ci.org/amekusa/conso1e) [![codecov](https://codecov.io/gh/amekusa/conso1e/branch/master/graph/badge.svg)](https://codecov.io/gh/amekusa/conso1e) [![npm](https://img.shields.io/badge/dynamic/json?label=npm&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Famekusa%2Fconso1e%2Fmaster%2Fpackage.json)](https://www.npmjs.com/package/conso1e)

## Features

- Supports method-chaining
- It's stateful
- Logs can be suppressed & bufferable
- Provides a global & singleton instance which is accessible across modules
- Labels
- Subcontexts

## Getting Started

Install it with NPM:

```sh
npm i conso1e
```

`require()` it and `create()` an instance:

```js
const console = require('conso1e').create();
console.log('Hello');
```

If you want to replace `console` with conso1e entirely, overwrite the global `console` variable:

```js
console = require('conso1e').create(); // Overwriting the builtin console object
console.log('Hello');

// You can still access the original console
// via .core property
console.core.log('Hello');
```

<small>* Beware that overwriting `console` affects the entire application</small>

Instead of creating a local instance, you can also use `global()` to access the **global instance**:

```js
const console = require('conso1e').global();
```

`global()` always returns the same instance. In other words, it returns **singleton**.  
The global instance persists across different modules.

**ES module loading** is also supported:

```js
import Conso1e from 'conso1e';
const console = Conso1e.create(); // Local instance
const console = Conso1e.global(); // Global instance
```

## Methods & Properties

### .suppress ( buffer = false )

Starts suppression. During suppression, any method calls don't output to the console.  
Suppression can be bypassed by prefixing methods with underscore (ex. `console.log()` → `console._log()` ).

- *@param \<boolean>* ***buffer***
	- If true, suppressed calls will be buffered
- *@return*
	- Returns `this`

---

### .unsuppress ( flush = true )

Ends suppression.

- *@param \<boolean>* ***flush***
	- If true, all the buffered calls are sent to the console at once
- *@return*
	- Returns `this`

---

### .flush ( )

Outputs and clears the current buffers

---

### .clearBuffers ( )

Clears the current buffers without output

---

### .option ( name[, value] )

Sets or returns an option value by `name`

- *@param \<string>* ***name***
	- Name of the option  
- *@param \<any>* ***value***
	- New value to set to the option
- *@return*
	- Returns `this` if `value` is provided. Otherwise, returns the option value

**Available Options:**

|          name | type    | description                                                  |
| ------------: | ------- | ------------------------------------------------------------ |
|       `label` | string  | If any string is set, it appears preceding every console output. |
| `forceOutput` | boolean | If it is `true`, suppression is completely ignored.          |

```js
// Example
let console = require('conso1e').create();
console.option('label', '[LABEL]');
console.log('ABC'); // '[LABEL] ABC'
console.log('DEF'); // '[LABEL] DEF'
```


---

### .subcontext ( )

Creates and returns a **subcontext**. Subcontext is a child conso1e instance that inherits the current state and the core from the parent.

A subcontext defaults to the parent's current state and the option values. However you can override these individually.

```js
// Example
let parent = require('conso1e').create();
let child = parent.subcontext();

parent.option('label', '[LABEL]');
parent.log('ABC'); // '[LABEL] ABC'
child.log('123');  // '[LABEL] 123' // label is inherited

child.option('label', '[SUB_LABEL]');
parent.log('ABC'); // '[LABEL] ABC'
child.log('123');  // '[SUB_LABEL] 123' // label is overriden
```

- *@return*
	- Returns a new subcontext instance

---

### .core

The real `console` object that is wrapped

*@type* ***object*** *(read only)

---

### .parent

The parent conso1e instance. It is `null` if `this` is not a subcontext

*@type* ***object \<conso1e>*** *(read only)

---

### .isSuppressed

Whether suppression is currently active, or not

*@type* ***boolean*** *(read only)

---

### .isBuffering

Whether buffering is currently active, or not

*@type* ***boolean*** *(read only)

---

### .hasBuffer

Whether the console has any buffered call

*@type* ***boolean*** *(read only)

## Advanced Usage

### Custom Console

`create()` function has the exact same parameters as the constructor of the built-in [Console class](https://nodejs.org/api/console.html#console_class_console).

```js
const debugLog = fs.createWriteStream('./debug.log');
const errorLog = fs.createWriteStream('./error.log');
const console = require('conso1e').create(debugLog, errorLog);
```

You can also pass a `console` object to `wrap()` :

```js
const myConsole = new console.Console(debugLog, errorLog);
const console = require('conso1e').wrap(myConsole);
```

---

&copy; 2020 [amekusa](https://amekusa.com)
