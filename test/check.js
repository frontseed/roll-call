/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')
const { WebCheck, RawCheck, CompositeCheck } = require('../lib/check')

const { expect } = chai.use(sinonChai)

describe('Checks', () => {
  describe('web', () => {
    let check
    let request

    describe('basic web check', () => {
      beforeEach(() => {
        check = new WebCheck('https://example.com/status')
        request = nock('https://example.com').get('/status')
      })

      it('returns status UP on HTTP 200 OK', async () => {
        // Arrange.
        request.reply(200, 'OK')
        // Act.
        const result = await check.run()
        // Assert.
        expect(result).to.eql({ status: 'UP' })
      })

      const codes = [201, 403, 500]
      codes.forEach(code => {
        it(`returns status DOWN on HTTP ${code}`, async () => {
          // Arrange.
          request.reply(code, 'SOMETHING')
          // Act.
          const result = await check.run()
          // Assert.
          expect(result).to.contain({ status: 'DOWN' })
        })
      })

      it('returns status DOWN when there is a socket timeout', async () => {
        // Arrange.
        check.options.timeout = 5
        request.socketDelay(10)
        // Act.
        const result = await check.run()
        // Assert.
        expect(result).to.contain({ status: 'DOWN' })
      })

      it('returns status DOWN when there is a connection error', async () => {
        // Arrange.
        request.replyWithError('ENOTFOUND')
        // Act.
        const result = await check.run()
        // Assert.
        expect(result).to.contain({ status: 'DOWN' })
      })

      it('returns a non-circular payload for JSON conversion', async () => {
        // Arrange.
        request.reply(503, 'something bad happened')
        const parser = r => () => JSON.stringify(r)
        // Act.
        const result = await check.run()
        // Assert.
        expect(parser(result)).to.not.throw()
      })
    })

    describe('web check with a callback', () => {
      let cb

      beforeEach(() => {
        cb = res => res && res.data && res.data.status === 'good'
          ? { status: 'UP' }
          : { status: 'DOWN' }
        check = new WebCheck('https://example.com/status', cb)
        request = nock('https://example.com').get('/status')
      })

      it('returns down on down condition', async () => {
        // Arrange.
        request.reply(200, { status: 'bad' })
        // Act.
        const result = await check.run()
        // Assert.
        expect(result).to.contain({ status: 'DOWN' })
      })

      it('returns up on up condition', async () => {
        // Arrange.
        request.reply(500, { status: 'good' })
        // Act.
        const result = await check.run()
        // Assert.
        expect(result).to.contain({ status: 'UP' })
      })
    })

    describe('web check with options and callback', () => {
      let cb
      let options

      beforeEach(() => {
        options = {
          validateStatus: () => true
        }
        cb = sinon.stub().returns({ status: 'UP' })
        check = new WebCheck('https://example.com/status', options, cb)
        request = nock('https://example.com').get('/status')
      })

      it('returns up on any condition', async () => {
        // Arrange.
        request.reply(404, {})
        // Act.
        const result = await check.run()
        // Assert.
        expect(cb).to.have.callCount(1)
        expect(result).to.not.have.property('error')
        expect(result).to.contain({ status: 'UP' })
      })
    })
  })

  describe('raw', () => {
    describe('basic raw check', () => {
      it('outputs exactly what is provided', () => {
        // Arrange.
        const output = { some: 'output' }
        const f = () => output
        const check = new RawCheck(f)
        // Act.
        const result = check.run()
        // Assert.
        expect(result).to.equal(output)
      })

      it('passes the arguments to the callback', () => {
        // Arrange.
        const arg1 = f => f
        const arg2 = { foo: 'bar' }
        const callback = sinon.spy()
        const check = new RawCheck(callback)
        // Act.
        check.run(arg1, arg2)
        // Assert.
        expect(callback).to.have.been.calledWith(arg1, arg2)
      })
    })
  })

  describe('composite', () => {
    describe('basic composite check', () => {
      it('outputs a map of composed check results', async () => {
        // Arrange.
        const f1 = () => 'f1'
        const f2 = () => 'f2'
        const check = new CompositeCheck({
          c1: new RawCheck(f1),
          c2: new RawCheck(f2)
        })
        // Act.
        const result = await check.run()
        // Assert.
        expect(result).to.eql({
          c1: 'f1',
          c2: 'f2'
        })
      })

      it('passes down arguments to the child check', async () => {
        // Arrange.
        const arg1 = f => f
        const arg2 = { foo: 'bar' }
        const callback = sinon.spy()
        const child = new RawCheck(callback)
        const check = new CompositeCheck({ child })
        // Act.
        check.run(arg1, arg2)
        // Assert.
        expect(callback).to.have.been.calledWith(arg1, arg2)
      })
    })
  })
})
