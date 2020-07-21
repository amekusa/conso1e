**conso1e** ( conso[one]e ) is a fully functional `console` wrapper with additional features. Since it wraps every `console` methods, you can simply replace `console` with it.

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

Instead of creating a local instance, you can also use `global()` to access the **global instance**:

```js
const console = require('console').global();
```

`global()` always returns the same instance. In other words, it returns **singleton**.  
The global instance persists across different modules.

## Methods

### .suppress ( buffer = false )

Starts suppression. During suppression, any method calls don't output to the console.  
Suppression can be bypassed by prefixing methods with underscore (ex. `console.log()` →  `console._log()` ).

*@param {boolean}* ***buffer:***  
	If true, suppressed calls will be buffered

### .unsuppress ( flush = true )

Ends suppression.

*@param {boolean}* ***flush:***  
	If true, all the buffered calls are sent to the console

### .flush ( )

Outputs and clears the current buffers

### .clearBuffers ( )

Clears the current buffers without output

## Properties

### .raw

Real `console` object

*@type* ***object***

### .isSuppressed

Whether suppression is currently active, or not

*@type* ***boolean***

### .isBuffering

Whether buffering is currently active, or not

*@type* ***boolean***

### .hasBuffer

Whether the console has any buffered call



---

&copy; 2020 [amekusa](https://amekusa.com)

