const { OK, SERVICE_UNAVAILABLE } = require('http-status-codes')
const { CompositeCheck } = require('./check')
const { UP, status } = require('./output')

const configure = checks => {
  const check = new CompositeCheck(checks)

  return (...args) => {
    return Promise.all([check.run.apply(check, args)])
      .then(([results]) => {
        const allOk = Object.values(results)
          .every(result => result.status === UP)
        const output = Object.assign({ ...status(allOk), ...results })
        const statusCode = allOk ? OK : SERVICE_UNAVAILABLE
        return { statusCode, output }
      })
  }
}

module.exports = {
  configure
}
