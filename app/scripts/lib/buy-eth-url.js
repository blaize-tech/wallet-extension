module.exports = getBuyEthUrl

/**
 * Gives the caller a url at which the user can acquire eth, depending on the network they are in
 *
 * @param {object} opts Options required to determine the correct url
 * @param {string} opts.network The network for which to return a url
 * @param {string} opts.amount The amount of AC to buy on coinbase. Only relevant if network === '1'.
 * @param {string} opts.address The address the bought AC should be sent to.  Only relevant if network === '1'.
 * @returns {string|undefined} The url at which the user can access AC, while in the given network. If the passed
 * network does not match any of the specified cases, or if no network is given, returns undefined.
 *
 */
function getBuyEthUrl ({ network, amount, address, service }) {
  // default service by network if not specified
  if (!service) service = getDefaultServiceForNetwork(network)

  switch (service) {
    case 'affilcoin':
      return `https://affilcoin.com/partners`
  }
  throw new Error(`Unknown cryptocurrency exchange or faucet: "${service}"`)
}

function getDefaultServiceForNetwork (network) {
  switch (network) {
    case '1':
      return 'affilcoin'
    case '3':
      return 'affilcoin'
  }
  throw new Error(`No default cryptocurrency exchange or faucet for networkId: "${network}"`)
}
