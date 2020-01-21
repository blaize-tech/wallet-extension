module.exports = function (address, network, rpcPrefs) {
  if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
    return `${rpcPrefs.blockExplorerUrl}/address/${address}`
  }

  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
      link = `https://etherscan.io/address/${address}`
      break
    case 3: // testnet test net
      link = `https://testnet.etherscan.io/address/${address}`
      break
    default:
      link = ''
      break
  }

  return link
}
