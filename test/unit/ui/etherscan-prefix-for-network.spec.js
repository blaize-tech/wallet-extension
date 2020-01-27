const assert = require('assert')
const etherscanNetworkPrefix = require('../../../ui/lib/etherscan-prefix-for-network')

describe('Etherscan Network Prefix', () => {

  it('returns empy string as default value', () => {
    assert.equal(etherscanNetworkPrefix(), '')
  })

  it('returns empty string as a prefix for networkId of 1', () => {
    assert.equal(etherscanNetworkPrefix(1), '')
  })

  it('returns testnet as prefix for networkId of 3', () => {
    assert.equal(etherscanNetworkPrefix(3), 'testnet.')
  })

})
