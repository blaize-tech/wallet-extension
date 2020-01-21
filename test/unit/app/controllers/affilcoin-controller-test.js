const assert = require('assert')
const sinon = require('sinon')
const clone = require('clone')
const nock = require('nock')
const ethUtil = require('ethereumjs-util')
const createThoughStream = require('through2').obj
const blacklistJSON = require('eth-phishing-detect/src/config')
const firstTimeState = require('../../../unit/localhostState')
const createTxMeta = require('../../../lib/createTxMeta')
const EthQuery = require('eth-query')

const threeBoxSpies = {
  init: sinon.spy(),
  getThreeBoxAddress: sinon.spy(),
  getThreeBoxSyncingState: sinon.stub().returns(true),
  turnThreeBoxSyncingOn: sinon.spy(),
  _registerUpdates: sinon.spy(),
}
const proxyquire = require('proxyquire')

class ThreeBoxControllerMock {
  constructor () {
    this.store = {
      subscribe: () => {},
      getState: () => ({}),
    }
    this.init = threeBoxSpies.init
    this.getThreeBoxAddress = threeBoxSpies.getThreeBoxAddress
    this.getThreeBoxSyncingState = threeBoxSpies.getThreeBoxSyncingState
    this.turnThreeBoxSyncingOn = threeBoxSpies.turnThreeBoxSyncingOn
    this._registerUpdates = threeBoxSpies._registerUpdates
  }
}

const AffilcoinController = proxyquire('../../../../app/scripts/metamask-controller', {
  './controllers/threebox': ThreeBoxControllerMock,
})

const currentNetworkId = 42
const DEFAULT_LABEL = 'Account 1'
const DEFAULT_LABEL_2 = 'Account 2'
const TEST_SEED = 'debris dizzy just program just float decrease vacant alarm reduce speak stadium'
const TEST_ADDRESS = '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'
const TEST_ADDRESS_2 = '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b'
const TEST_ADDRESS_3 = '0xeb9e64b93097bc15f01f13eae97015c57ab64823'
const TEST_SEED_ALT = 'setup olympic issue mobile velvet surge alcohol burger horse view reopen gentle'
const TEST_ADDRESS_ALT = '0xc42edfcc21ed14dda456aa0756c153f7985d8813'
const CUSTOM_RPC_URL = 'http://localhost:8545'

describe('AffilcoinController', function () {
  let affilcoinController
  const sandbox = sinon.createSandbox()
  const noop = () => {}

  beforeEach(function () {

    nock('https://api.infura.io')
      .persist()
      .get('/v2/blacklist')
      .reply(200, blacklistJSON)

    nock('https://api.infura.io')
      .get('/v1/ticker/ethusd')
      .reply(200, '{"base": "ETH", "quote": "USD", "bid": 288.45, "ask": 288.46, "volume": 112888.17569277, "exchange": "bitfinex", "total_volume": 272175.00106721005, "num_exchanges": 8, "timestamp": 1506444677}')

    nock('https://api.infura.io')
      .get('/v1/ticker/ethjpy')
      .reply(200, '{"base": "ETH", "quote": "JPY", "bid": 32300.0, "ask": 32400.0, "volume": 247.4616071, "exchange": "kraken", "total_volume": 247.4616071, "num_exchanges": 1, "timestamp": 1506444676}')

    nock('https://api.infura.io')
      .persist()
      .get(/.*/)
      .reply(200)

    nock('https://min-api.cryptocompare.com')
      .persist()
      .get(/.*/)
      .reply(200, '{"JPY":12415.9}')

    affilcoinController = new AffilcoinController({
      showUnapprovedTx: noop,
      showUnconfirmedMessage: noop,
      encryptor: {
        encrypt: function (_, object) {
          this.object = object
          return Promise.resolve('mock-encrypted')
        },
        decrypt: function () {
          return Promise.resolve(this.object)
        },
      },
      initState: clone(firstTimeState),
      platform: { showTransactionNotification: () => {} },
    })
    // disable diagnostics
    affilcoinController.diagnostics = null
    // add sinon method spies
    sandbox.spy(affilcoinController.keyringController, 'createNewVaultAndKeychain')
    sandbox.spy(affilcoinController.keyringController, 'createNewVaultAndRestore')
  })

  afterEach(function () {
    nock.cleanAll()
    sandbox.restore()
  })

  describe('#getAccounts', function () {

    beforeEach(async function () {
      const password = 'a-fake-password'

      await affilcoinController.createNewVaultAndRestore(password, TEST_SEED)
    })

    it('returns first address when dapp calls web3.eth.getAccounts', function () {
      affilcoinController.networkController._baseProviderParams.getAccounts((err, res) => {
        assert.ifError(err)
        assert.equal(res.length, 1)
        assert.equal(res[0], '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc')
      })
    })
  })

  describe('#importAccountWithStrategy', function () {

    const importPrivkey = '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553'

    beforeEach(async function () {
      const password = 'a-fake-password'

      await affilcoinController.createNewVaultAndRestore(password, TEST_SEED)
      await affilcoinController.importAccountWithStrategy('Private Key', [ importPrivkey ])
    })

    it('adds private key to keyrings in KeyringController', async function () {
      const simpleKeyrings = affilcoinController.keyringController.getKeyringsByType('Simple Key Pair')
      const privKeyBuffer = simpleKeyrings[0].wallets[0]._privKey
      const pubKeyBuffer = simpleKeyrings[0].wallets[0]._pubKey
      const addressBuffer = ethUtil.pubToAddress(pubKeyBuffer)
      const privKey = ethUtil.bufferToHex(privKeyBuffer)
      const pubKey = ethUtil.bufferToHex(addressBuffer)
      assert.equal(privKey, ethUtil.addHexPrefix(importPrivkey))
      assert.equal(pubKey, '0xe18035bf8712672935fdb4e5e431b1a0183d2dfc')
    })

    it('adds private key to keyrings in KeyringController', async function () {
      const keyringAccounts = await affilcoinController.keyringController.getAccounts()
      assert.equal(keyringAccounts[keyringAccounts.length - 1], '0xe18035bf8712672935fdb4e5e431b1a0183d2dfc')
    })
  })

  describe('submitPassword', function () {
    const password = 'password'

    beforeEach(async function () {
      await affilcoinController.createNewVaultAndKeychain(password)
      threeBoxSpies.init.reset()
      threeBoxSpies.turnThreeBoxSyncingOn.reset()
    })

    it('removes any identities that do not correspond to known accounts.', async function () {
      const fakeAddress = '0xbad0'
      affilcoinController.preferencesController.addAddresses([fakeAddress])
      await affilcoinController.submitPassword(password)

      const identities = Object.keys(affilcoinController.preferencesController.store.getState().identities)
      const addresses = await affilcoinController.keyringController.getAccounts()

      identities.forEach((identity) => {
        assert.ok(addresses.includes(identity), `addresses should include all IDs: ${identity}`)
      })

      addresses.forEach((address) => {
        assert.ok(identities.includes(address), `identities should include all Addresses: ${address}`)
      })
    })

    it('gets the address from threebox and creates a new 3box instance', async () => {
      await affilcoinController.submitPassword(password)
      assert(threeBoxSpies.init.calledOnce)
      assert(threeBoxSpies.turnThreeBoxSyncingOn.calledOnce)
    })
  })

  describe('#getGasPrice', function () {

    it('gives the 50th percentile lowest accepted gas price from recentBlocksController', async function () {
      const realRecentBlocksController = affilcoinController.recentBlocksController
      affilcoinController.recentBlocksController = {
        store: {
          getState: () => {
            return {
              recentBlocks: [
                { gasPrices: [ '0x3b9aca00', '0x174876e800'] },
                { gasPrices: [ '0x3b9aca00', '0x174876e800'] },
                { gasPrices: [ '0x174876e800', '0x174876e800' ]},
                { gasPrices: [ '0x174876e800', '0x174876e800' ]},
              ],
            }
          },
        },
      }

      const gasPrice = affilcoinController.getGasPrice()
      assert.equal(gasPrice, '0x174876e800', 'accurately estimates 65th percentile accepted gas price')

      affilcoinController.recentBlocksController = realRecentBlocksController
    })
  })

  describe('#createNewVaultAndKeychain', function () {
    it('can only create new vault on keyringController once', async function () {
      const selectStub = sandbox.stub(affilcoinController, 'selectFirstIdentity')

      const password = 'a-fake-password'

      await affilcoinController.createNewVaultAndKeychain(password)
      await affilcoinController.createNewVaultAndKeychain(password)

      assert(affilcoinController.keyringController.createNewVaultAndKeychain.calledOnce)

      selectStub.reset()
    })
  })

  describe('#createNewVaultAndRestore', function () {
    it('should be able to call newVaultAndRestore despite a mistake.', async function () {
      const password = 'what-what-what'
      sandbox.stub(affilcoinController, 'getBalance')
      affilcoinController.getBalance.callsFake(() => { return Promise.resolve('0x0') })

      await affilcoinController.createNewVaultAndRestore(password, TEST_SEED.slice(0, -1)).catch(() => null)
      await affilcoinController.createNewVaultAndRestore(password, TEST_SEED)

      assert(affilcoinController.keyringController.createNewVaultAndRestore.calledTwice)
    })

    it('should clear previous identities after vault restoration', async () => {
      sandbox.stub(affilcoinController, 'getBalance')
      affilcoinController.getBalance.callsFake(() => { return Promise.resolve('0x0') })

      await affilcoinController.createNewVaultAndRestore('foobar1337', TEST_SEED)
      assert.deepEqual(affilcoinController.getState().identities, {
        [TEST_ADDRESS]: { address: TEST_ADDRESS, name: DEFAULT_LABEL },
      })

      await affilcoinController.preferencesController.setAccountLabel(TEST_ADDRESS, 'Account Foo')
      assert.deepEqual(affilcoinController.getState().identities, {
        [TEST_ADDRESS]: { address: TEST_ADDRESS, name: 'Account Foo' },
      })

      await affilcoinController.createNewVaultAndRestore('foobar1337', TEST_SEED_ALT)
      assert.deepEqual(affilcoinController.getState().identities, {
        [TEST_ADDRESS_ALT]: { address: TEST_ADDRESS_ALT, name: DEFAULT_LABEL },
      })
    })

    it('should restore any consecutive accounts with balances', async () => {
      sandbox.stub(affilcoinController, 'getBalance')
      affilcoinController.getBalance.withArgs(TEST_ADDRESS).callsFake(() => {
        return Promise.resolve('0x14ced5122ce0a000')
      })
      affilcoinController.getBalance.withArgs(TEST_ADDRESS_2).callsFake(() => {
        return Promise.resolve('0x0')
      })
      affilcoinController.getBalance.withArgs(TEST_ADDRESS_3).callsFake(() => {
        return Promise.resolve('0x14ced5122ce0a000')
      })

      await affilcoinController.createNewVaultAndRestore('foobar1337', TEST_SEED)
      assert.deepEqual(affilcoinController.getState().identities, {
        [TEST_ADDRESS]: { address: TEST_ADDRESS, name: DEFAULT_LABEL },
        [TEST_ADDRESS_2]: { address: TEST_ADDRESS_2, name: DEFAULT_LABEL_2 },
      })
    })
  })

  describe('#getBalance', () => {
    it('should return the balance known by accountTracker', async () => {
      const accounts = {}
      const balance = '0x14ced5122ce0a000'
      accounts[TEST_ADDRESS] = { balance: balance }

      affilcoinController.accountTracker.store.putState({ accounts: accounts })

      const gotten = await affilcoinController.getBalance(TEST_ADDRESS)

      assert.equal(balance, gotten)
    })

    it('should ask the network for a balance when not known by accountTracker', async () => {
      const accounts = {}
      const balance = '0x14ced5122ce0a000'
      const ethQuery = new EthQuery()
      sinon.stub(ethQuery, 'getBalance').callsFake((_, callback) => {
        callback(undefined, balance)
      })

      affilcoinController.accountTracker.store.putState({ accounts: accounts })

      const gotten = await affilcoinController.getBalance(TEST_ADDRESS, ethQuery)

      assert.equal(balance, gotten)
    })
  })

  describe('#getApi', function () {
    let getApi, state

    beforeEach(function () {
      getApi = affilcoinController.getApi()
    })

    it('getState', function (done) {
      getApi.getState((err, res) => {
        if (err) {
          done(err)
        } else {
          state = res
        }
      })
      assert.deepEqual(state, affilcoinController.getState())
      done()
    })

  })

  describe('preferencesController', function () {

    it('defaults useBlockie to false', function () {
      assert.equal(affilcoinController.preferencesController.store.getState().useBlockie, false)
    })

    it('setUseBlockie to true', function () {
      affilcoinController.setUseBlockie(true, noop)
      assert.equal(affilcoinController.preferencesController.store.getState().useBlockie, true)
    })

  })

  describe('#selectFirstIdentity', function () {
    let identities, address

    beforeEach(function () {
      address = '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'
      identities = {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          'address': address,
          'name': 'Account 1',
        },
        '0xc42edfcc21ed14dda456aa0756c153f7985d8813': {
          'address': '0xc42edfcc21ed14dda456aa0756c153f7985d8813',
          'name': 'Account 2',
        },
      }
      affilcoinController.preferencesController.store.updateState({ identities })
      affilcoinController.selectFirstIdentity()
    })

    it('changes preferences controller select address', function () {
      const preferenceControllerState = affilcoinController.preferencesController.store.getState()
      assert.equal(preferenceControllerState.selectedAddress, address)
    })

    it('changes affilcoin controller selected address', function () {
      const affilcoinState = affilcoinController.getState()
      assert.equal(affilcoinState.selectedAddress, address)
    })
  })

  describe('connectHardware', function () {

    it('should throw if it receives an unknown device name', async function () {
      try {
        await affilcoinController.connectHardware('Some random device name', 0, `m/44/0'/0'`)
      } catch (e) {
        assert.equal(e, 'Error: AffilcoinController:getKeyringForDevice - Unknown device')
      }
    })

    it('should add the Trezor Hardware keyring', async function () {
      sinon.spy(affilcoinController.keyringController, 'addNewKeyring')
      await affilcoinController.connectHardware('trezor', 0).catch(() => null)
      const keyrings = await affilcoinController.keyringController.getKeyringsByType(
        'Trezor Hardware'
      )
      assert.equal(affilcoinController.keyringController.addNewKeyring.getCall(0).args, 'Trezor Hardware')
      assert.equal(keyrings.length, 1)
    })

    it('should add the Ledger Hardware keyring', async function () {
      sinon.spy(affilcoinController.keyringController, 'addNewKeyring')
      await affilcoinController.connectHardware('ledger', 0).catch(() => null)
      const keyrings = await affilcoinController.keyringController.getKeyringsByType(
        'Ledger Hardware'
      )
      assert.equal(affilcoinController.keyringController.addNewKeyring.getCall(0).args, 'Ledger Hardware')
      assert.equal(keyrings.length, 1)
    })

  })

  describe('checkHardwareStatus', function () {
    it('should throw if it receives an unknown device name', async function () {
      try {
        await affilcoinController.checkHardwareStatus('Some random device name', `m/44/0'/0'`)
      } catch (e) {
        assert.equal(e, 'Error: AffilcoinController:getKeyringForDevice - Unknown device')
      }
    })

    it('should be locked by default', async function () {
      await affilcoinController.connectHardware('trezor', 0).catch(() => null)
      const status = await affilcoinController.checkHardwareStatus('trezor')
      assert.equal(status, false)
    })
  })

  describe('forgetDevice', function () {
    it('should throw if it receives an unknown device name', async function () {
      try {
        await affilcoinController.forgetDevice('Some random device name')
      } catch (e) {
        assert.equal(e, 'Error: AffilcoinController:getKeyringForDevice - Unknown device')
      }
    })

    it('should wipe all the keyring info', async function () {
      await affilcoinController.connectHardware('trezor', 0).catch(() => null)
      await affilcoinController.forgetDevice('trezor')
      const keyrings = await affilcoinController.keyringController.getKeyringsByType(
        'Trezor Hardware'
      )

      assert.deepEqual(keyrings[0].accounts, [])
      assert.deepEqual(keyrings[0].page, 0)
      assert.deepEqual(keyrings[0].isUnlocked(), false)
    })
  })

  describe('unlockHardwareWalletAccount', function () {
    let accountToUnlock
    let windowOpenStub
    let addNewAccountStub
    let getAccountsStub
    beforeEach(async function () {
      accountToUnlock = 10
      windowOpenStub = sinon.stub(window, 'open')
      windowOpenStub.returns(noop)

      addNewAccountStub = sinon.stub(affilcoinController.keyringController, 'addNewAccount')
      addNewAccountStub.returns({})

      getAccountsStub = sinon.stub(affilcoinController.keyringController, 'getAccounts')
      // Need to return different address to mock the behavior of
      // adding a new account from the keyring
      getAccountsStub.onCall(0).returns(Promise.resolve(['0x1']))
      getAccountsStub.onCall(1).returns(Promise.resolve(['0x2']))
      getAccountsStub.onCall(2).returns(Promise.resolve(['0x3']))
      getAccountsStub.onCall(3).returns(Promise.resolve(['0x4']))
      sinon.spy(affilcoinController.preferencesController, 'setAddresses')
      sinon.spy(affilcoinController.preferencesController, 'setSelectedAddress')
      sinon.spy(affilcoinController.preferencesController, 'setAccountLabel')
      await affilcoinController.connectHardware('trezor', 0, `m/44/0'/0'`).catch(() => null)
      await affilcoinController.unlockHardwareWalletAccount(accountToUnlock, 'trezor', `m/44/0'/0'`)
    })

    afterEach(function () {
      window.open.restore()
      affilcoinController.keyringController.addNewAccount.restore()
      affilcoinController.keyringController.getAccounts.restore()
      affilcoinController.preferencesController.setAddresses.restore()
      affilcoinController.preferencesController.setSelectedAddress.restore()
      affilcoinController.preferencesController.setAccountLabel.restore()
    })

    it('should set unlockedAccount in the keyring', async function () {
      const keyrings = await affilcoinController.keyringController.getKeyringsByType(
        'Trezor Hardware'
      )
      assert.equal(keyrings[0].unlockedAccount, accountToUnlock)
    })


    it('should call keyringController.addNewAccount', async function () {
      assert(affilcoinController.keyringController.addNewAccount.calledOnce)
    })

    it('should call keyringController.getAccounts ', async function () {
      assert(affilcoinController.keyringController.getAccounts.called)
    })

    it('should call preferencesController.setAddresses', async function () {
      assert(affilcoinController.preferencesController.setAddresses.calledOnce)
    })

    it('should call preferencesController.setSelectedAddress', async function () {
      assert(affilcoinController.preferencesController.setSelectedAddress.calledOnce)
    })

    it('should call preferencesController.setAccountLabel', async function () {
      assert(affilcoinController.preferencesController.setAccountLabel.calledOnce)
    })


  })

  describe('#setCustomRpc', function () {
    let rpcTarget

    beforeEach(function () {
      rpcTarget = affilcoinController.setCustomRpc(CUSTOM_RPC_URL)
    })

    it('returns custom RPC that when called', async function () {
      assert.equal(await rpcTarget, CUSTOM_RPC_URL)
    })

    it('changes the network controller rpc', function () {
      const networkControllerState = affilcoinController.networkController.store.getState()
      assert.equal(networkControllerState.provider.rpcTarget, CUSTOM_RPC_URL)
    })
  })

  describe('#setCurrentCurrency', function () {
    let defaultAffilcoinCurrency

    beforeEach(function () {
      defaultAffilcoinCurrency = affilcoinController.currencyRateController.state.currentCurrency
    })

    it('defaults to usd', function () {
      assert.equal(defaultAffilcoinCurrency, 'usd')
    })

    it('sets currency to JPY', function () {
      affilcoinController.setCurrentCurrency('JPY', noop)
      assert.equal(affilcoinController.currencyRateController.state.currentCurrency, 'JPY')
    })
  })

  describe('#createShapeshifttx', function () {
    let depositAddress, depositType, shapeShiftTxList

    beforeEach(function () {
      nock('https://shapeshift.io')
        .get('/txStat/3EevLFfB4H4XMWQwYCgjLie1qCAGpd2WBc')
        .reply(200, '{"status": "no_deposits", "address": "3EevLFfB4H4XMWQwYCgjLie1qCAGpd2WBc"}')

      depositAddress = '3EevLFfB4H4XMWQwYCgjLie1qCAGpd2WBc'
      depositType = 'ETH'
      shapeShiftTxList = affilcoinController.shapeshiftController.state.shapeShiftTxList
    })

    it('creates a shapeshift tx', async function () {
      affilcoinController.createShapeShiftTx(depositAddress, depositType)
      assert.equal(shapeShiftTxList[0].depositAddress, depositAddress)
    })

  })

  describe('#addNewAccount', function () {
    let addNewAccount

    beforeEach(function () {
      addNewAccount = affilcoinController.addNewAccount()
    })

    it('errors when an primary keyring is does not exist', async function () {
      try {
        await addNewAccount
        assert.equal(1 === 0)
      } catch (e) {
        assert.equal(e.message, 'AffilcoinController - No HD Key Tree found')
      }
    })
  })

  describe('#verifyseedPhrase', function () {
    it('errors when no keying is provided', async function () {
      try {
        await affilcoinController.verifySeedPhrase()
      } catch (error) {
        assert.equal(error.message, 'AffilcoinController - No HD Key Tree found')
      }
    })

    beforeEach(async function () {
      await affilcoinController.createNewVaultAndKeychain('password')
    })

    it('#addNewAccount', async function () {
      await affilcoinController.addNewAccount()
      const getAccounts = await affilcoinController.keyringController.getAccounts()
      assert.equal(getAccounts.length, 2)
    })
  })

  describe('#resetAccount', function () {

    beforeEach(function () {
      const selectedAddressStub = sinon.stub(affilcoinController.preferencesController, 'getSelectedAddress')
      const getNetworkstub = sinon.stub(affilcoinController.txController.txStateManager, 'getNetwork')

      selectedAddressStub.returns('0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc')
      getNetworkstub.returns(42)

      affilcoinController.txController.txStateManager._saveTxList([
        createTxMeta({ id: 1, status: 'unapproved', affilcoinNetworkId: currentNetworkId, txParams: {from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'} }),
        createTxMeta({ id: 1, status: 'unapproved', affilcoinNetworkId: currentNetworkId, txParams: {from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'} }),
        createTxMeta({ id: 2, status: 'rejected', affilcoinNetworkId: 32 }),
        createTxMeta({ id: 3, status: 'submitted', affilcoinNetworkId: currentNetworkId, txParams: {from: '0xB09d8505E1F4EF1CeA089D47094f5DD3464083d4'} }),
      ])
    })

    it('wipes transactions from only the correct network id and with the selected address', async function () {
      await affilcoinController.resetAccount()
      assert.equal(affilcoinController.txController.txStateManager.getTx(1), undefined)
    })
  })

  describe('#removeAccount', function () {
    let ret
    const addressToRemove = '0x1'

    beforeEach(async function () {
      sinon.stub(affilcoinController.preferencesController, 'removeAddress')
      sinon.stub(affilcoinController.accountTracker, 'removeAccount')
      sinon.stub(affilcoinController.keyringController, 'removeAccount')

      ret = await affilcoinController.removeAccount(addressToRemove)

    })

    afterEach(function () {
      affilcoinController.keyringController.removeAccount.restore()
      affilcoinController.accountTracker.removeAccount.restore()
      affilcoinController.preferencesController.removeAddress.restore()
    })

    it('should call preferencesController.removeAddress', async function () {
      assert(affilcoinController.preferencesController.removeAddress.calledWith(addressToRemove))
    })
    it('should call accountTracker.removeAccount', async function () {
      assert(affilcoinController.accountTracker.removeAccount.calledWith([addressToRemove]))
    })
    it('should call keyringController.removeAccount', async function () {
      assert(affilcoinController.keyringController.removeAccount.calledWith(addressToRemove))
    })
    it('should return address', async function () {
      assert.equal(ret, '0x1')
    })
  })

  describe('#setCurrentLocale', function () {

    it('checks the default currentLocale', function () {
      const preferenceCurrentLocale = affilcoinController.preferencesController.store.getState().currentLocale
      assert.equal(preferenceCurrentLocale, undefined)
    })

    it('sets current locale in preferences controller', function () {
      affilcoinController.setCurrentLocale('ja', noop)
      const preferenceCurrentLocale = affilcoinController.preferencesController.store.getState().currentLocale
      assert.equal(preferenceCurrentLocale, 'ja')
    })

  })

  describe('#newUnsignedMessage', () => {

    let msgParams, affilcoinMsgs, messages, msgId

    const address = '0xc42edfcc21ed14dda456aa0756c153f7985d8813'
    const data = '0x43727970746f6b697474696573'

    beforeEach(async () => {
      sandbox.stub(affilcoinController, 'getBalance')
      affilcoinController.getBalance.callsFake(() => { return Promise.resolve('0x0') })

      await affilcoinController.createNewVaultAndRestore('foobar1337', TEST_SEED_ALT)

      msgParams = {
        'from': address,
        'data': data,
      }

      const promise = affilcoinController.newUnsignedMessage(msgParams)
      // handle the promise so it doesn't throw an unhandledRejection
      promise.then(noop).catch(noop)

      affilcoinMsgs = affilcoinController.messageManager.getUnapprovedMsgs()
      messages = affilcoinController.messageManager.messages
      msgId = Object.keys(affilcoinMsgs)[0]
      messages[0].msgParams.affilcoinId = parseInt(msgId)
    })

    it('persists address from msg params', function () {
      assert.equal(affilcoinMsgs[msgId].msgParams.from, address)
    })

    it('persists data from msg params', function () {
      assert.equal(affilcoinMsgs[msgId].msgParams.data, data)
    })

    it('sets the status to unapproved', function () {
      assert.equal(affilcoinMsgs[msgId].status, 'unapproved')
    })

    it('sets the type to eth_sign', function () {
      assert.equal(affilcoinMsgs[msgId].type, 'eth_sign')
    })

    it('rejects the message', function () {
      const msgIdInt = parseInt(msgId)
      affilcoinController.cancelMessage(msgIdInt, noop)
      assert.equal(messages[0].status, 'rejected')
    })

    it('errors when signing a message', async function () {
      try {
        await affilcoinController.signMessage(messages[0].msgParams)
      } catch (error) {
        assert.equal(error.message, 'message length is invalid')
      }
    })
  })

  describe('#newUnsignedPersonalMessage', function () {
    let msgParams, affilcoinPersonalMsgs, personalMessages, msgId

    const address = '0xc42edfcc21ed14dda456aa0756c153f7985d8813'
    const data = '0x43727970746f6b697474696573'

    beforeEach(async function () {
      sandbox.stub(affilcoinController, 'getBalance')
      affilcoinController.getBalance.callsFake(() => { return Promise.resolve('0x0') })

      await affilcoinController.createNewVaultAndRestore('foobar1337', TEST_SEED_ALT)

      msgParams = {
        'from': address,
        'data': data,
      }

      const promise = affilcoinController.newUnsignedPersonalMessage(msgParams)
      // handle the promise so it doesn't throw an unhandledRejection
      promise.then(noop).catch(noop)

      affilcoinPersonalMsgs = affilcoinController.personalMessageManager.getUnapprovedMsgs()
      personalMessages = affilcoinController.personalMessageManager.messages
      msgId = Object.keys(affilcoinPersonalMsgs)[0]
      personalMessages[0].msgParams.affilcoinId = parseInt(msgId)
    })

    it('errors with no from in msgParams', async () => {
      const msgParams = {
        'data': data,
      }
      try {
        await affilcoinController.newUnsignedPersonalMessage(msgParams)
        assert.fail('should have thrown')
      } catch (error) {
        assert.equal(error.message, 'Affilcoin Message Signature: from field is required.')
      }
    })

    it('persists address from msg params', function () {
      assert.equal(affilcoinPersonalMsgs[msgId].msgParams.from, address)
    })

    it('persists data from msg params', function () {
      assert.equal(affilcoinPersonalMsgs[msgId].msgParams.data, data)
    })

    it('sets the status to unapproved', function () {
      assert.equal(affilcoinPersonalMsgs[msgId].status, 'unapproved')
    })

    it('sets the type to personal_sign', function () {
      assert.equal(affilcoinPersonalMsgs[msgId].type, 'personal_sign')
    })

    it('rejects the message', function () {
      const msgIdInt = parseInt(msgId)
      affilcoinController.cancelPersonalMessage(msgIdInt, noop)
      assert.equal(personalMessages[0].status, 'rejected')
    })

    it('errors when signing a message', async function () {
      await affilcoinController.signPersonalMessage(personalMessages[0].msgParams)
      assert.equal(affilcoinPersonalMsgs[msgId].status, 'signed')
      assert.equal(affilcoinPersonalMsgs[msgId].rawSig, '0x6a1b65e2b8ed53cf398a769fad24738f9fbe29841fe6854e226953542c4b6a173473cb152b6b1ae5f06d601d45dd699a129b0a8ca84e78b423031db5baa734741b')
    })
  })

  describe('#setupUntrustedCommunication', function () {
    let streamTest

    const phishingUrl = new URL('http://myethereumwalletntw.com')

    afterEach(function () {
      streamTest.end()
    })

    it('sets up phishing stream for untrusted communication ', async () => {
      await affilcoinController.phishingController.updatePhishingLists()

      const { promise, resolve } = deferredPromise()

      streamTest = createThoughStream((chunk, _, cb) => {
        if (chunk.name !== 'phishing') return cb()
        assert.equal(chunk.data.hostname, phishingUrl.hostname)
        resolve()
        cb()
      })
      affilcoinController.setupUntrustedCommunication(streamTest, phishingUrl)

      await promise
    })
  })

  describe('#setupTrustedCommunication', function () {
    let streamTest

    afterEach(function () {
      streamTest.end()
    })

    it('sets up controller dnode api for trusted communication', function (done) {
      streamTest = createThoughStream((chunk, _, cb) => {
        assert.equal(chunk.name, 'controller')
        cb()
        done()
      })

      affilcoinController.setupTrustedCommunication(streamTest, 'mycrypto.com')
    })
  })

  describe('#markPasswordForgotten', function () {
    it('adds and sets forgottenPassword to config data to true', function () {
      affilcoinController.markPasswordForgotten(noop)
      const state = affilcoinController.getState()
      assert.equal(state.forgottenPassword, true)
    })
  })

  describe('#unMarkPasswordForgotten', function () {
    it('adds and sets forgottenPassword to config data to false', function () {
      affilcoinController.unMarkPasswordForgotten(noop)
      const state = affilcoinController.getState()
      assert.equal(state.forgottenPassword, false)
    })
  })

  describe('#_onKeyringControllerUpdate', function () {
    it('should do nothing if there are no keyrings in state', async function () {
      const addAddresses = sinon.fake()
      const syncWithAddresses = sinon.fake()
      sandbox.replace(affilcoinController, 'preferencesController', {
        addAddresses,
      })
      sandbox.replace(affilcoinController, 'accountTracker', {
        syncWithAddresses,
      })

      const oldState = affilcoinController.getState()
      await affilcoinController._onKeyringControllerUpdate({keyrings: []})

      assert.ok(addAddresses.notCalled)
      assert.ok(syncWithAddresses.notCalled)
      assert.deepEqual(affilcoinController.getState(), oldState)
    })

    it('should update selected address if keyrings was locked', async function () {
      const addAddresses = sinon.fake()
      const getSelectedAddress = sinon.fake.returns('0x42')
      const setSelectedAddress = sinon.fake()
      const syncWithAddresses = sinon.fake()
      sandbox.replace(affilcoinController, 'preferencesController', {
        addAddresses,
        getSelectedAddress,
        setSelectedAddress,
      })
      sandbox.replace(affilcoinController, 'accountTracker', {
        syncWithAddresses,
      })

      const oldState = affilcoinController.getState()
      await affilcoinController._onKeyringControllerUpdate({
        isUnlocked: false,
        keyrings: [{
          accounts: ['0x1', '0x2'],
        }],
      })

      assert.deepEqual(addAddresses.args, [[['0x1', '0x2']]])
      assert.deepEqual(syncWithAddresses.args, [[['0x1', '0x2']]])
      assert.deepEqual(setSelectedAddress.args, [['0x1']])
      assert.deepEqual(affilcoinController.getState(), oldState)
    })

    it('should NOT update selected address if already unlocked', async function () {
      const addAddresses = sinon.fake()
      const syncWithAddresses = sinon.fake()
      sandbox.replace(affilcoinController, 'preferencesController', {
        addAddresses,
      })
      sandbox.replace(affilcoinController, 'accountTracker', {
        syncWithAddresses,
      })

      const oldState = affilcoinController.getState()
      await affilcoinController._onKeyringControllerUpdate({
        isUnlocked: true,
        keyrings: [{
          accounts: ['0x1', '0x2'],
        }],
      })

      assert.deepEqual(addAddresses.args, [[['0x1', '0x2']]])
      assert.deepEqual(syncWithAddresses.args, [[['0x1', '0x2']]])
      assert.deepEqual(affilcoinController.getState(), oldState)
    })
  })

})

function deferredPromise () {
  let resolve
  const promise = new Promise(_resolve => { resolve = _resolve })
  return { promise, resolve }
}
