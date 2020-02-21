const version = 3
const oldTestRpc = 'https://rawtestrpc.affilcoin.com/'
const newTestRpc = 'https://testrpc.affilcoin.com/'

const clone = require('clone')

module.exports = {
  version,

  migrate: function (originalVersionedData) {
    const versionedData = clone(originalVersionedData)
    versionedData.meta.version = version
    try {
      if (versionedData.data.config.provider.rpcTarget === oldTestRpc) {
        versionedData.data.config.provider.rpcTarget = newTestRpc
      }
    } catch (e) {}
    return Promise.resolve(versionedData)
  },
}
