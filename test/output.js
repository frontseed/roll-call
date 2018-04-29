/* eslint-env mocha */
const { expect } = require('chai')
const output = require('../lib/output')

describe('Status output', () => {
  const UP = { status: 'UP' }
  const DOWN = { status: 'DOWN' }
  const extra = { extra: 'value' }

  it('returns status up', () => {
    // Assert.
    expect(output.up()).to.eql(UP)
  })

  it('returns output down', () => {
    // Assert.
    expect(output.down()).to.eql(DOWN)
  })

  it('returns output up with extra properties', () => {
    // Assert.
    expect(output.up(extra)).to.eql({ ...UP, ...extra })
  })

  it('returns output down with extra properties', () => {
    // Assert.
    expect(output.down(extra)).to.eql({ ...DOWN, ...extra })
  })

  it('does not allow status to be overwritten', () => {
    // Assert.
    expect(output.up(DOWN)).to.eql(UP)
  })
})
