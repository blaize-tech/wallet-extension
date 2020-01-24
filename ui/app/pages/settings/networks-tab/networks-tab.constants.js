const defaultNetworksData = [
  {
    labelKey: 'mainnet',
    iconColor: '#29B6AF',
    providerType: 'rpc',
    rpcUrl: 'https://explorer.affilcoin.net/api-',
    chainId: '67',
    ticker: 'AC',
    blockExplorerUrl: 'https://etherscan.io',
  },
  {
    labelKey: 'testnet',
    iconColor: '#006600',
    providerType: 'testnet',
    rpcUrl: 'https://api.infura.io/v1/jsonrpc/testnet',
    chainId: '3',
    ticker: 'AC',
    blockExplorerUrl: 'https://testnet.etherscan.io',
  },
  {
    labelKey: 'localhost',
    iconColor: 'white',
    border: '1px solid #6A737D',
    providerType: 'localhost',
    rpcUrl: 'http://localhost:8545/',
    blockExplorerUrl: 'https://etherscan.io',
  },
]

export {
  defaultNetworksData,
}
