const { valuesFor } = require('../../helpers/utils/util')
const abi = require('human-standard-token-abi')
const {
  multiplyCurrencies,
} = require('../../helpers/utils/conversion-util')
const {
  getAffilcoinAccounts,
  getSelectedAddress,
  getAddressBook,
} = require('../../selectors/selectors')
const {
  estimateGasPriceFromRecentBlocks,
  calcGasTotal,
} = require('./send.utils')
import {
  getAveragePriceEstimateInHexWEI,
} from '../../selectors/custom-gas'

const selectors = {
  accountsWithSendEtherInfoSelector,
  getAmountConversionRate,
  getBlockGasLimit,
  getConversionRate,
  getCurrentAccountWithSendEtherInfo,
  getCurrentCurrency,
  getCurrentNetwork,
  getCurrentViewContext,
  getForceGasMin,
  getNativeCurrency,
  getGasLimit,
  getGasPrice,
  getGasPriceFromRecentBlocks,
  getGasTotal,
  getPrimaryCurrency,
  getRecentBlocks,
  getSelectedAccount,
  getSelectedIdentity,
  getSelectedToken,
  getSelectedTokenContract,
  getSelectedTokenExchangeRate,
  getSelectedTokenToFiatRate,
  getSendAmount,
  getSendHexData,
  getSendHexDataFeatureFlagState,
  getSendEditingTransactionId,
  getSendEnsResolution,
  getSendEnsResolutionError,
  getSendErrors,
  getSendFrom,
  getSendFromBalance,
  getSendFromObject,
  getSendMaxModeState,
  getSendTo,
  getSendToAccounts,
  getSendToNickname,
  getTokenBalance,
  getTokenExchangeRate,
  getUnapprovedTxs,
  transactionsSelector,
  getQrCodeData,
}

module.exports = selectors

function accountsWithSendEtherInfoSelector (state) {
  const accounts = getAffilcoinAccounts(state)
  const { identities } = state.affilcoin
  const accountsWithSendEtherInfo = Object.entries(accounts).map(([key, account]) => {
    return Object.assign({}, account, identities[key])
  })

  return accountsWithSendEtherInfo
}

function getAmountConversionRate (state) {
  return getSelectedToken(state)
    ? getSelectedTokenToFiatRate(state)
    : getConversionRate(state)
}

function getBlockGasLimit (state) {
  return state.affilcoin.currentBlockGasLimit
}

function getConversionRate (state) {
  return state.affilcoin.conversionRate
}

function getCurrentAccountWithSendEtherInfo (state) {
  const currentAddress = getSelectedAddress(state)
  const accounts = accountsWithSendEtherInfoSelector(state)

  return accounts.find(({ address }) => address === currentAddress)
}

function getCurrentCurrency (state) {
  return state.affilcoin.currentCurrency
}

function getNativeCurrency (state) {
  return state.affilcoin.nativeCurrency
}

function getCurrentNetwork (state) {
  return state.affilcoin.network
}

function getCurrentViewContext (state) {
  const { currentView = {} } = state.appState
  return currentView.context
}

function getForceGasMin (state) {
  return state.affilcoin.send.forceGasMin
}

function getGasLimit (state) {
  return state.affilcoin.send.gasLimit || '0'
}

function getGasPrice (state) {
  return state.affilcoin.send.gasPrice || getAveragePriceEstimateInHexWEI(state)
}

function getGasPriceFromRecentBlocks (state) {
  return estimateGasPriceFromRecentBlocks(state.affilcoin.recentBlocks)
}

function getGasTotal (state) {
  return calcGasTotal(getGasLimit(state), getGasPrice(state))
}

function getPrimaryCurrency (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken && selectedToken.symbol
}

function getRecentBlocks (state) {
  return state.affilcoin.recentBlocks
}

function getSelectedAccount (state) {
  const accounts = getAffilcoinAccounts(state)
  const selectedAddress = getSelectedAddress(state)

  return accounts[selectedAddress]
}

function getSelectedIdentity (state) {
  const selectedAddress = getSelectedAddress(state)
  const identities = state.affilcoin.identities

  return identities[selectedAddress]
}

function getSelectedToken (state) {
  const tokens = state.affilcoin.tokens || []
  const selectedTokenAddress = state.affilcoin.selectedTokenAddress
  const selectedToken = tokens.filter(({ address }) => address === selectedTokenAddress)[0]
  const sendToken = state.affilcoin.send.token

  return selectedToken || sendToken || null
}

function getSelectedTokenContract (state) {
  const selectedToken = getSelectedToken(state)

  return selectedToken
    ? global.eth.contract(abi).at(selectedToken.address)
    : null
}

function getSelectedTokenExchangeRate (state) {
  const tokenExchangeRates = state.affilcoin.tokenExchangeRates
  const selectedToken = getSelectedToken(state) || {}
  const { symbol = '' } = selectedToken
  const pair = `${symbol.toLowerCase()}_ac`
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates && tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

function getSelectedTokenToFiatRate (state) {
  const selectedTokenExchangeRate = getSelectedTokenExchangeRate(state)
  const conversionRate = getConversionRate(state)

  const tokenToFiatRate = multiplyCurrencies(
    conversionRate,
    selectedTokenExchangeRate,
    { toNumericBase: 'dec' }
  )

  return tokenToFiatRate
}

function getSendAmount (state) {
  return state.affilcoin.send.amount
}

function getSendHexData (state) {
  return state.affilcoin.send.data
}

function getSendHexDataFeatureFlagState (state) {
  return state.affilcoin.featureFlags.sendHexData
}

function getSendEditingTransactionId (state) {
  return state.affilcoin.send.editingTransactionId
}

function getSendErrors (state) {
  return state.send.errors
}

function getSendFrom (state) {
  return state.affilcoin.send.from
}

function getSendFromBalance (state) {
  const from = getSendFrom(state) || getSelectedAccount(state)
  return from.balance
}

function getSendFromObject (state) {
  return getSendFrom(state) || getCurrentAccountWithSendEtherInfo(state)
}

function getSendMaxModeState (state) {
  return state.affilcoin.send.maxModeOn
}

function getSendTo (state) {
  return state.affilcoin.send.to
}

function getSendToNickname (state) {
  return state.affilcoin.send.toNickname
}

function getSendToAccounts (state) {
  const fromAccounts = accountsWithSendEtherInfoSelector(state)
  const addressBookAccounts = getAddressBook(state)
  return [...fromAccounts, ...addressBookAccounts]
}
function getTokenBalance (state) {
  return state.affilcoin.send.tokenBalance
}

function getSendEnsResolution (state) {
  return state.affilcoin.send.ensResolution
}

function getSendEnsResolutionError (state) {
  return state.affilcoin.send.ensResolutionError
}

function getTokenExchangeRate (state, tokenSymbol) {
  const pair = `${tokenSymbol.toLowerCase()}_ac`
  const tokenExchangeRates = state.affilcoin.tokenExchangeRates
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

function getUnapprovedTxs (state) {
  return state.affilcoin.unapprovedTxs
}

function transactionsSelector (state) {
  const { network, selectedTokenAddress } = state.affilcoin
  const unapprovedMsgs = valuesFor(state.affilcoin.unapprovedMsgs)
  const shapeShiftTxList = (network === '1') ? state.affilcoin.shapeShiftTxList : undefined
  const transactions = state.affilcoin.selectedAddressTxList || []
  const txsToRender = !shapeShiftTxList ? transactions.concat(unapprovedMsgs) : transactions.concat(unapprovedMsgs, shapeShiftTxList)

  return selectedTokenAddress
    ? txsToRender
      .filter(({ txParams }) => txParams && txParams.to === selectedTokenAddress)
      .sort((a, b) => b.time - a.time)
    : txsToRender
      .sort((a, b) => b.time - a.time)
}

function getQrCodeData (state) {
  return state.appState.qrCodeData
}
