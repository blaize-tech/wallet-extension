const assert = require('assert')
const getBuyEthUrl = require('../../../app/scripts/lib/buy-eth-url')

describe('buy-eth-url', function () {
  const mainnet = {
    network: '1',
    amount: 5,
    address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
  }
  const testnet = {
    network: '3',
  }

  it('returns coinbase url with amount and address for network 1', function () {
    const wyreUrl = getBuyEthUrl(mainnet)

    assert.equal(wyreUrl, 'https://dash.sendwyre.com/sign-up')

  })

  it('returns affilcoin testnet faucet for network 3', function () {
    const testnetUrl = getBuyEthUrl(testnet)
    assert.equal(testnetUrl, 'https://faucet.affilcoin.com/')
  })

})

