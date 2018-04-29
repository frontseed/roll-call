# Roll Call

A module to provide upstream dependency checks for service health endpoints

[![Build Status](https://travis-ci.org/frontseed/roll-call.svg?branch=master)](https://travis-ci.org/frontseed/roll-call)

## Requirements

This module is written with standards ES2015 and up and does not use any transpilers.  
The required NodeJS engine is `>8.6`.

## Usage

The module should work with any web framework.

```js
const rc = require('@frontseed/roll-call')

const checks = rc.configure({
  // Check a simple HTTP endpoint if it returns 200.
  mySimpleWebCheck: new rc.WebCheck('https://example.com/status'),

  // Add options and a custom callback to execute your own response checks.
  myComplexWebCheck: new rc.WebCheck(
    // URL to check.
    'https://example.com/other',
    // Options passed to the underlying Axios web client.
    {
      validateStatus: () => true,
      timeout: 5000
    },
    // Callback to run on response.
    res => (res && !res.error ? rc.up() : rc.down(res))
  ),

  // Add a raw check to check on any custom dependency such as a socket connection.
  myRawCheck: new RawCheck(() => {
    const result = myInternalCheck()
    return result ? rc.up() : rc.down()
  })
})
```

The `configure()` method here returns a function which returns a Promise.  
This promise resolves to a an object containing a status code and a JSON payload to serve in a health endpoint payload 
with a web framework of your choice. Add your own handler to cater for this.

## Credits

This is a simplified, more modern and framework agnostic variant of `@hmcts/nodejs-healthcheck`.
