**conso1e** ( conso[one]e ) is a fully functional `console` wrapper with additional features. Since it wraps every `console` method, you can simply replace `console` with it.

## Features

- Supports method-chaining
- It's stateful
- Logs can be suppressed & bufferable
- Provides a global & singleton instance which is accessible across modules

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

- *@param {boolean}* ***buffer***
	- If true, suppressed calls will be buffered
- *@return*
	- The object itself

---

### .unsuppress ( flush = true )

Ends suppression.

- *@param {boolean}* ***flush***
	- If true, all the buffered calls are sent to the console
- *@return*
	- The object itself

---

### .flush ( )

Outputs and clears the current buffers

---

### .clearBuffers ( )

Clears the current buffers without output

---

### .core

Real `console` object

- *@type* ***object***

---

### .isSuppressed

Whether suppression is currently active, or not

- *@type* ***boolean***

---

### .isBuffering

Whether buffering is currently active, or not

- *@type* ***boolean***

---

### .hasBuffer

Whether the console has any buffered call

- *@type* ***boolean***

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
