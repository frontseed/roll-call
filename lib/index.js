const { WebCheck, RawCheck } = require('./check')
const { up, down, status } = require('./output')
const { configure } = require('./route')

module.exports = {
  configure,
  up,
  down,
  status,
  WebCheck,
  RawCheck
}
