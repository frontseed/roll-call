/* eslint-env mocha */
const { expect } = require('chai')
const { OK, SERVICE_UNAVAILABLE } = require('http-status-codes')
const route = require('../lib/route')
const { RawCheck } = require('../lib/check')
const { up, down } = require('../lib/output')

describe('Route', () => {
  describe('configure', () => {
    let makeCheck = isOk => new RawCheck(() => isOk ? up() : down())

    it('returns OK when all checks pass', async () => {
      // Arrange.
      const r = route.configure({
        check1: makeCheck(true),
        check2: makeCheck(true)
      })
      const expected = {
        statusCode: OK,
        output: {
          ...up(),
          check1: up(),
          check2: up()
        }
      }
      // Act.
      const out = await r()
      // Assert.
      expect(out).to.eql(expected)
    })

    it('returns Service Unavailable when any checks fail', async () => {
      // Arrange.
      const r = route.configure({
        check1: makeCheck(false),
        check2: makeCheck(true)
      })
      const expected = {
        statusCode: SERVICE_UNAVAILABLE,
        output: {
          ...down(),
          check1: down(),
          check2: up()
        }
      }
      // Act.
      const out = await r()
      // Assert.
      expect(out).to.eql(expected)
    })
  })
})
