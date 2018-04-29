const UP = 'UP'
const DOWN = 'DOWN'

const status = (s, extra = {}) => ({ ...extra, ...{ status: s ? UP : DOWN } })
const up = (extra = {}) => status(true, extra)
const down = (extra = {}) => status(false, extra)

module.exports = {
  UP,
  status,
  up,
  down
}
