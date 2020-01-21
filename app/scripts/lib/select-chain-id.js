const {
  MAINNET_CHAIN_ID,
  TESTNET_CHAIN_ID,
} = require('./enums')

const standardNetworkId = {
  '1': MAINNET_CHAIN_ID,
  '3': TESTNET_CHAIN_ID,
}

function selectChainId (affilcoinState) {
  const { network, provider: { chainId } } = affilcoinState
  return standardNetworkId[network] || `0x${parseInt(chainId, 10).toString(16)}`
}

module.exports = selectChainId
