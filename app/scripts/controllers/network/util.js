const {
  TESTNET,
  RINKEBY,
  KOVAN,
  MAINNET,
  GOERLI,
  TESTNET_CODE,
  RINKEBY_CODE,
  KOVAN_CODE,
  GOERLI_CODE,
  TESTNET_DISPLAY_NAME,
  RINKEBY_DISPLAY_NAME,
  KOVAN_DISPLAY_NAME,
  MAINNET_DISPLAY_NAME,
  GOERLI_DISPLAY_NAME,
} = require('./enums')

const networkToNameMap = {
  [TESTNET]: TESTNET_DISPLAY_NAME,
  [RINKEBY]: RINKEBY_DISPLAY_NAME,
  [KOVAN]: KOVAN_DISPLAY_NAME,
  [MAINNET]: MAINNET_DISPLAY_NAME,
  [GOERLI]: GOERLI_DISPLAY_NAME,
  [TESTNET_CODE]: TESTNET_DISPLAY_NAME,
  [RINKEBY_CODE]: RINKEBY_DISPLAY_NAME,
  [KOVAN_CODE]: KOVAN_DISPLAY_NAME,
  [GOERLI_CODE]: GOERLI_DISPLAY_NAME,
}

const getNetworkDisplayName = key => networkToNameMap[key]

function formatTxMetaForRpcResult (txMeta) {
  return {
    'blockHash': txMeta.txReceipt ? txMeta.txReceipt.blockHash : null,
    'blockNumber': txMeta.txReceipt ? txMeta.txReceipt.blockNumber : null,
    'from': txMeta.txParams.from,
    'gas': txMeta.txParams.gas,
    'gasPrice': txMeta.txParams.gasPrice,
    'hash': txMeta.hash,
    'input': txMeta.txParams.data || '0x',
    'nonce': txMeta.txParams.nonce,
    'to': txMeta.txParams.to,
    'transactionIndex': txMeta.txReceipt ? txMeta.txReceipt.transactionIndex : null,
    'value': txMeta.txParams.value || '0x0',
    'v': txMeta.v,
    'r': txMeta.r,
    's': txMeta.s,
  }
}


module.exports = {
  getNetworkDisplayName,
  formatTxMetaForRpcResult,
}
