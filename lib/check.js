const axios = require('axios')
const { OK } = require('http-status-codes')
const { up, down } = require('./output')

class WebCheck {
  constructor (url, options = {}, callback = null) {
    const cb = typeof options === 'function' ? options : callback

    this.url = url
    this.options = options
    this.callback = cb || WebCheck.defaultCallback
  }

  static defaultCallback (res) {
    return res && res.status === OK ? up() : down(res)
  }

  static clean (res) {
    return Object.keys(res)
      .filter(key => !key.match(/request|config/))
      .reduce((r, key) => ({ ...r, [key]: res[key] }), {})
  }

  async run () {
    try {
      const { status, statusText, data } = await axios.get(this.url, { ...this.options })
      return this.callback({ status, statusText, data })
    } catch (err) {
      if (err.response) {
        // Clean up the axios response so it can be stringified straight away.
        const response = WebCheck.clean(err.response)
        return this.callback({ error: err.message, ...response })
      }

      return this.callback({ error: err.message })
    }
  }
}

class RawCheck {
  constructor (callback) {
    this.callback = callback
  }

  run (...args) {
    return this.callback.apply(null, args)
  }
}

class CompositeCheck {
  constructor (checks) {
    this.checks = checks
  }

  async run (...args) {
    const checks = Object.entries(this.checks)
    const promises = checks.map(check => check[1].run.apply(check[1], args))
    const result = await Promise.all(promises)

    return result
      .map((result, i) => [checks[i][0], result])
      .reduce((prev, curr) => Object.assign(prev, { [curr[0]]: curr[1] }), {})
  }
}

module.exports = {
  WebCheck,
  RawCheck,
  CompositeCheck
}
