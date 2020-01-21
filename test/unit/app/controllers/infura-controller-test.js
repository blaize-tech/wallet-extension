const assert = require('assert')
const sinon = require('sinon')
const InfuraController = require('../../../../app/scripts/controllers/infura')

describe('infura-controller', function () {
  let infuraController, sandbox, networkStatus
  const response = {'mainnet': 'degraded', 'testnet': 'ok'}

  before(async function () {
    infuraController = new InfuraController()
    sandbox = sinon.createSandbox()
    sinon.stub(infuraController, 'checkInfuraNetworkStatus').resolves(response)
    networkStatus = await infuraController.checkInfuraNetworkStatus()
  })

  after(function () {
    sandbox.restore()
  })

  describe('Network status queries', function () {

    describe('Mainnet', function () {
      it('should have Mainnet', function () {
        assert.equal(Object.keys(networkStatus)[0], 'mainnet')
      })

      it('should have a value for Mainnet status', function () {
        assert.equal(networkStatus.mainnet, 'degraded')
      })
    })

    describe('Testnet', function () {
      it('should have Testnet', function () {
        assert.equal(Object.keys(networkStatus)[1], 'testnet')
      })

      it('should have a value for Testnet status', function () {
        assert.equal(networkStatus.testnet, 'ok')
      })
    })
  })
})
