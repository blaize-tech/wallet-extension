import { NETWORK_TYPES } from '../helpers/constants/common'
import { stripHexPrefix, addHexPrefix } from 'ethereumjs-util'

const abi = require('human-standard-token-abi')
const {
  multiplyCurrencies,
} = require('../helpers/utils/conversion-util')
import {
  addressSlicer,
  checksumAddress,
} from '../helpers/utils/util'

const selectors = {
  getSelectedAddress,
  getSelectedIdentity,
  getSelectedAccount,
  getSelectedToken,
  getSelectedTokenExchangeRate,
  getSelectedTokenAssetImage,
  getAssetImages,
  getTokenExchangeRate,
  conversionRateSelector,
  accountsWithSendEtherInfoSelector,
  getCurrentAccountWithSendEtherInfo,
  getGasIsLoading,
  getForceGasMin,
  getAddressBook,
  getSendFrom,
  getCurrentCurrency,
  getNativeCurrency,
  getSendAmount,
  getSelectedTokenToFiatRate,
  getSelectedTokenContract,
  getSendMaxModeState,
  getCurrentViewContext,
  getTotalUnapprovedCount,
  preferencesSelector,
  getAffilcoinAccounts,
  getCurrentEthBalance,
  getNetworkIdentifier,
  isBalanceCached,
  getAdvancedInlineGasShown,
  getUseNonceField,
  getCustomNonceValue,
  getIsMainnet,
  getCurrentNetworkId,
  getSelectedAsset,
  getCurrentKeyring,
  getAccountType,
  getNumberOfAccounts,
  getNumberOfTokens,
  getDaiV1Token,
  isEthereumNetwork,
  getMetaMetricState,
  getRpcPrefsForCurrentProvider,
  getKnownMethodData,
  getAddressBookEntry,
  getAddressBookEntryName,
  getFeatureFlags,
}

module.exports = selectors

function getNetworkIdentifier (state) {
  const { affilcoin: { provider: { type, nickname, rpcTarget } } } = state

  return nickname || rpcTarget || type
}

function getCurrentKeyring (state) {
  const identity = getSelectedIdentity(state)

  if (!identity) {
    return null
  }

  const simpleAddress = stripHexPrefix(identity.address).toLowerCase()

  const keyring = state.affilcoin.keyrings.find((kr) => {
    return kr.accounts.includes(simpleAddress) ||
      kr.accounts.includes(identity.address)
  })

  return keyring
}

function getAccountType (state) {
  const currentKeyring = getCurrentKeyring(state)
  const type = currentKeyring && currentKeyring.type

  switch (type) {
    case 'Trezor Hardware':
    case 'Ledger Hardware':
      return 'hardware'
    case 'Simple Key Pair':
      return 'imported'
    default:
      return 'default'
  }
}

function getSelectedAsset (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken && selectedToken.symbol || 'AC'
}

function getCurrentNetworkId (state) {
  return state.affilcoin.network
}

function getSelectedAddress (state) {
  const selectedAddress = state.affilcoin.selectedAddress || Object.keys(getAffilcoinAccounts(state))[0]

  return selectedAddress
}

function getSelectedIdentity (state) {
  const selectedAddress = getSelectedAddress(state)
  const identities = state.affilcoin.identities

  return identities[selectedAddress]
}

function getNumberOfAccounts (state) {
  return Object.keys(state.affilcoin.accounts).length
}

function getNumberOfTokens (state) {
  const tokens = state.affilcoin.tokens
  return tokens ? tokens.length : 0
}

function getAffilcoinAccounts (state) {
  const currentAccounts = state.affilcoin.accounts
  const cachedBalances = state.affilcoin.cachedBalances[state.affilcoin.network]
  const selectedAccounts = {}

  Object.keys(currentAccounts).forEach(accountID => {
    const account = currentAccounts[accountID]
    if (account && account.balance === null || account.balance === undefined) {
      selectedAccounts[accountID] = {
        ...account,
        balance: cachedBalances && cachedBalances[accountID],
      }
    } else {
      selectedAccounts[accountID] = account
    }
  })
  return selectedAccounts
}

function isBalanceCached (state) {
  const selectedAccountBalance = state.affilcoin.accounts[getSelectedAddress(state)].balance
  const cachedBalance = getSelectedAccountCachedBalance(state)

  return Boolean(!selectedAccountBalance && cachedBalance)
}

function getSelectedAccountCachedBalance (state) {
  const cachedBalances = state.affilcoin.cachedBalances[state.affilcoin.network]
  const selectedAddress = getSelectedAddress(state)

  return cachedBalances && cachedBalances[selectedAddress]
}

function getSelectedAccount (state) {
  const accounts = getAffilcoinAccounts(state)
  const selectedAddress = getSelectedAddress(state)

  return accounts[selectedAddress]
}

function getSelectedToken (state) {
  const tokens = state.affilcoin.tokens || []
  const selectedTokenAddress = state.affilcoin.selectedTokenAddress
  const selectedToken = tokens.filter(({ address }) => address === selectedTokenAddress)[0]
  const sendToken = state.affilcoin.send && state.affilcoin.send.token

  return selectedToken || sendToken || null
}

function getSelectedTokenExchangeRate (state) {
  const contractExchangeRates = state.affilcoin.contractExchangeRates
  const selectedToken = getSelectedToken(state) || {}
  const { address } = selectedToken
  return contractExchangeRates[address] || 0
}

function getSelectedTokenAssetImage (state) {
  const assetImages = state.affilcoin.assetImages || {}
  const selectedToken = getSelectedToken(state) || {}
  const { address } = selectedToken
  return assetImages[address]
}

function getAssetImages (state) {
  const assetImages = state.affilcoin.assetImages || {}
  return assetImages
}

function getTokenExchangeRate (state, address) {
  const contractExchangeRates = state.affilcoin.contractExchangeRates
  return contractExchangeRates[address] || 0
}

function conversionRateSelector (state) {
  return state.affilcoin.conversionRate
}

function getAddressBook (state) {
  const network = state.affilcoin.network
  if (!state.affilcoin.addressBook[network]) {
    return []
  }
  return Object.values(state.affilcoin.addressBook[network])
}

function getAddressBookEntry (state, address) {
  const addressBook = getAddressBook(state)
  const entry = addressBook.find(contact => contact.address === checksumAddress(address))
  return entry
}

function getAddressBookEntryName (state, address) {
  const entry = getAddressBookEntry(state, address) || state.affilcoin.identities[address]
  return entry && entry.name !== '' ? entry.name : addressSlicer(address)
}

function getDaiV1Token (state) {
  const OLD_DAI_CONTRACT_ADDRESS = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'
  const tokens = state.affilcoin.tokens || []
  return tokens.find(({address}) => checksumAddress(address) === OLD_DAI_CONTRACT_ADDRESS)
}

function accountsWithSendEtherInfoSelector (state) {
  const accounts = getAffilcoinAccounts(state)
  const { identities } = state.affilcoin

  const accountsWithSendEtherInfo = Object.entries(accounts).map(([key, account]) => {
    return Object.assign({}, account, identities[key])
  })

  return accountsWithSendEtherInfo
}

function getCurrentAccountWithSendEtherInfo (state) {
  const currentAddress = getSelectedAddress(state)
  const accounts = accountsWithSendEtherInfoSelector(state)

  return accounts.find(({ address }) => address === currentAddress)
}

function getCurrentEthBalance (state) {
  return getCurrentAccountWithSendEtherInfo(state).balance
}

function getGasIsLoading (state) {
  return state.appState.gasIsLoading
}

function getForceGasMin (state) {
  return state.affilcoin.send.forceGasMin
}

function getSendFrom (state) {
  return state.affilcoin.send.from
}

function getSendAmount (state) {
  return state.affilcoin.send.amount
}

function getSendMaxModeState (state) {
  return state.affilcoin.send.maxModeOn
}

function getCurrentCurrency (state) {
  return state.affilcoin.currentCurrency
}

function getNativeCurrency (state) {
  return state.affilcoin.nativeCurrency
}

function getSelectedTokenToFiatRate (state) {
  const selectedTokenExchangeRate = getSelectedTokenExchangeRate(state)
  const conversionRate = conversionRateSelector(state)

  const tokenToFiatRate = multiplyCurrencies(
    conversionRate,
    selectedTokenExchangeRate,
    { toNumericBase: 'dec' }
  )

  return tokenToFiatRate
}

function getSelectedTokenContract (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken
    ? global.eth.contract(abi).at(selectedToken.address)
    : null
}

function getCurrentViewContext (state) {
  const { currentView = {} } = state.appState
  return currentView.context
}

function getTotalUnapprovedCount ({ affilcoin }) {
  const {
    unapprovedTxs = {},
    unapprovedMsgCount,
    unapprovedPersonalMsgCount,
    unapprovedTypedMessagesCount,
  } = affilcoin

  return Object.keys(unapprovedTxs).length + unapprovedMsgCount + unapprovedPersonalMsgCount +
    unapprovedTypedMessagesCount
}

function getIsMainnet (state) {
  const networkType = getNetworkIdentifier(state)
  return networkType === NETWORK_TYPES.MAINNET
}

function isEthereumNetwork (state) {
  const networkType = getNetworkIdentifier(state)
  const {
    MAINNET,
    TESTNET,
  } = NETWORK_TYPES

  return [ MAINNET, TESTNET ].includes(networkType)
}

function preferencesSelector ({ affilcoin }) {
  return affilcoin.preferences
}

function getAdvancedInlineGasShown (state) {
  return Boolean(state.affilcoin.featureFlags.advancedInlineGas)
}

function getUseNonceField (state) {
  return Boolean(state.affilcoin.useNonceField)
}

function getCustomNonceValue (state) {
  return String(state.affilcoin.customNonceValue)
}

function getMetaMetricState (state) {
  return {
    network: getCurrentNetworkId(state),
    activeCurrency: getSelectedAsset(state),
    accountType: getAccountType(state),
    metaMetricsId: state.affilcoin.metaMetricsId,
    numberOfTokens: getNumberOfTokens(state),
    numberOfAccounts: getNumberOfAccounts(state),
    participateInMetaMetrics: state.affilcoin.participateInMetaMetrics,
  }
}

function getRpcPrefsForCurrentProvider (state) {
  const { frequentRpcListDetail, provider } = state.affilcoin
  const selectRpcInfo = frequentRpcListDetail.find(rpcInfo => rpcInfo.rpcUrl === provider.rpcTarget)
  const { rpcPrefs = {} } = selectRpcInfo || {}
  return rpcPrefs
}

function getKnownMethodData (state, data) {
  if (!data) {
    return null
  }
  const prefixedData = addHexPrefix(data)
  const fourBytePrefix = prefixedData.slice(0, 10)
  const { knownMethodData } = state.affilcoin

  return knownMethodData && knownMethodData[fourBytePrefix]
}

function getFeatureFlags (state) {
  return state.affilcoin.featureFlags
}
