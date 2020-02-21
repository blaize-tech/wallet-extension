const extend = require('xtend')
const actions = require('../../store/actions')
const { getEnvironmentType } = require('../../../../app/scripts/lib/util')
const { ENVIRONMENT_TYPE_POPUP } = require('../../../../app/scripts/lib/enums')
const { OLD_UI_NETWORK_TYPE } = require('../../../../app/scripts/controllers/network/enums')

module.exports = reduceAffilcoin

function reduceAffilcoin (state, action) {
  let newState

  // clone + defaults
  var affilcoinState = extend({
    isInitialized: false,
    isUnlocked: false,
    isAccountMenuOpen: false,
    isPopup: getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_POPUP,
    rpcTarget: 'https://rawtestrpc.affilcoin.com/',
    identities: {},
    unapprovedTxs: {},
    frequentRpcList: [],
    addressBook: [],
    selectedTokenAddress: null,
    contractExchangeRates: {},
    tokenExchangeRates: {},
    tokens: [],
    pendingTokens: {},
    customNonceValue: '',
    send: {
      gasLimit: null,
      gasPrice: null,
      gasTotal: null,
      tokenBalance: '0x0',
      from: '',
      to: '',
      amount: '0',
      memo: '',
      errors: {},
      maxModeOn: false,
      editingTransactionId: null,
      forceGasMin: null,
      toNickname: '',
      ensResolution: null,
      ensResolutionError: '',
    },
    coinOptions: {},
    useBlockie: false,
    featureFlags: {},
    networkEndpointType: OLD_UI_NETWORK_TYPE,
    welcomeScreenSeen: false,
    currentLocale: '',
    preferences: {
      useNativeCurrencyAsPrimaryCurrency: true,
      showFiatInTestnets: false,
    },
    firstTimeFlowType: null,
    completedOnboarding: false,
    knownMethodData: {},
    participateInMetaMetrics: null,
    metaMetricsSendCount: 0,
    nextNonce: null,
  }, state.affilcoin)

  switch (action.type) {

    case actions.UPDATE_AFFILCOIN_STATE:
      return extend(affilcoinState, action.value)

    case actions.UNLOCK_AFFILCOIN:
      return extend(affilcoinState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })

    case actions.LOCK_AFFILCOIN:
      return extend(affilcoinState, {
        isUnlocked: false,
      })

    case actions.SET_RPC_LIST:
      return extend(affilcoinState, {
        frequentRpcList: action.value,
      })

    case actions.SET_RPC_TARGET:
      return extend(affilcoinState, {
        provider: {
          type: 'rpc',
          rpcTarget: action.value,
        },
      })

    case actions.SET_PROVIDER_TYPE:
      return extend(affilcoinState, {
        provider: {
          type: action.value,
        },
      })

    case actions.COMPLETED_TX:
      var stringId = String(action.id)
      newState = extend(affilcoinState, {
        unapprovedTxs: {},
        unapprovedMsgs: {},
      })
      for (const id in affilcoinState.unapprovedTxs) {
        if (id !== stringId) {
          newState.unapprovedTxs[id] = affilcoinState.unapprovedTxs[id]
        }
      }
      for (const id in affilcoinState.unapprovedMsgs) {
        if (id !== stringId) {
          newState.unapprovedMsgs[id] = affilcoinState.unapprovedMsgs[id]
        }
      }
      return newState

    case actions.EDIT_TX:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          editingTransactionId: action.value,
        },
      })

    case actions.CLEAR_SEED_WORD_CACHE:
      newState = extend(affilcoinState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })
      return newState

    case actions.SHOW_ACCOUNT_DETAIL:
      newState = extend(affilcoinState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })
      return newState

    case actions.SET_SELECTED_TOKEN:
      newState = extend(affilcoinState, {
        selectedTokenAddress: action.value,
      })
      const newSend = extend(affilcoinState.send)

      if (affilcoinState.send.editingTransactionId && !action.value) {
        delete newSend.token
        const unapprovedTx = newState.unapprovedTxs[newSend.editingTransactionId] || {}
        const txParams = unapprovedTx.txParams || {}
        newState.unapprovedTxs = extend(newState.unapprovedTxs, {
          [newSend.editingTransactionId]: extend(unapprovedTx, {
            txParams: extend(txParams, { data: '' }),
          }),
        })
        newSend.tokenBalance = null
        newSend.balance = '0'
      }

      newState.send = newSend
      return newState

    case actions.SET_ACCOUNT_LABEL:
      const account = action.value.account
      const name = action.value.label
      const id = {}
      id[account] = extend(affilcoinState.identities[account], { name })
      const identities = extend(affilcoinState.identities, id)
      return extend(affilcoinState, { identities })

    case actions.SET_CURRENT_FIAT:
      return extend(affilcoinState, {
        currentCurrency: action.value.currentCurrency,
        conversionRate: action.value.conversionRate,
        conversionDate: action.value.conversionDate,
      })

    case actions.UPDATE_TOKENS:
      return extend(affilcoinState, {
        tokens: action.newTokens,
      })

    // affilcoin.send
    case actions.UPDATE_GAS_LIMIT:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          gasLimit: action.value,
        },
      })
    case actions.UPDATE_CUSTOM_NONCE:
      return extend(affilcoinState, {
        customNonceValue: action.value,
      })
    case actions.UPDATE_GAS_PRICE:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          gasPrice: action.value,
        },
      })

    case actions.TOGGLE_ACCOUNT_MENU:
      return extend(affilcoinState, {
        isAccountMenuOpen: !affilcoinState.isAccountMenuOpen,
      })

    case actions.UPDATE_GAS_TOTAL:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          gasTotal: action.value,
        },
      })

    case actions.UPDATE_SEND_TOKEN_BALANCE:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          tokenBalance: action.value,
        },
      })

    case actions.UPDATE_SEND_HEX_DATA:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          data: action.value,
        },
      })

    case actions.UPDATE_SEND_FROM:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          from: action.value,
        },
      })

    case actions.UPDATE_SEND_TO:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          to: action.value.to,
          toNickname: action.value.nickname,
        },
      })

    case actions.UPDATE_SEND_AMOUNT:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          amount: action.value,
        },
      })

    case actions.UPDATE_SEND_MEMO:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          memo: action.value,
        },
      })

    case actions.UPDATE_MAX_MODE:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          maxModeOn: action.value,
        },
      })

    case actions.UPDATE_SEND:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          ...action.value,
        },
      })

    case actions.UPDATE_SEND_ENS_RESOLUTION:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          ensResolution: action.payload,
          ensResolutionError: '',
        },
      })

    case actions.UPDATE_SEND_ENS_RESOLUTION_ERROR:
      return extend(affilcoinState, {
        send: {
          ...affilcoinState.send,
          ensResolution: null,
          ensResolutionError: action.payload,
        },
      })

    case actions.CLEAR_SEND:
      return extend(affilcoinState, {
        send: {
          gasLimit: null,
          gasPrice: null,
          gasTotal: null,
          tokenBalance: null,
          from: '',
          to: '',
          amount: '0x0',
          memo: '',
          errors: {},
          maxModeOn: false,
          editingTransactionId: null,
          forceGasMin: null,
          toNickname: '',
        },
      })

    case actions.UPDATE_TRANSACTION_PARAMS:
      const { id: txId, value } = action
      let { selectedAddressTxList } = affilcoinState
      selectedAddressTxList = selectedAddressTxList.map(tx => {
        if (tx.id === txId) {
          const newTx = Object.assign({}, tx)
          newTx.txParams = value
          return newTx
        }
        return tx
      })

      return extend(affilcoinState, {
        selectedAddressTxList,
      })

    case actions.PAIR_UPDATE:
      const { value: { marketinfo: pairMarketInfo } } = action
      return extend(affilcoinState, {
        tokenExchangeRates: {
          ...affilcoinState.tokenExchangeRates,
          [pairMarketInfo.pair]: pairMarketInfo,
        },
      })

    case actions.SHAPESHIFT_SUBVIEW:
      const { value: { marketinfo: ssMarketInfo, coinOptions } } = action
      return extend(affilcoinState, {
        tokenExchangeRates: {
          ...affilcoinState.tokenExchangeRates,
          [ssMarketInfo.pair]: ssMarketInfo,
        },
        coinOptions,
      })

    case actions.SET_PARTICIPATE_IN_METAMETRICS:
      return extend(affilcoinState, {
        participateInMetaMetrics: action.value,
      })

    case actions.SET_METAMETRICS_SEND_COUNT:
      return extend(affilcoinState, {
        metaMetricsSendCount: action.value,
      })

    case actions.SET_USE_BLOCKIE:
      return extend(affilcoinState, {
        useBlockie: action.value,
      })

    case actions.UPDATE_FEATURE_FLAGS:
      return extend(affilcoinState, {
        featureFlags: action.value,
      })

    case actions.UPDATE_NETWORK_ENDPOINT_TYPE:
      return extend(affilcoinState, {
        networkEndpointType: action.value,
      })

    case actions.CLOSE_WELCOME_SCREEN:
      return extend(affilcoinState, {
        welcomeScreenSeen: true,
      })

    case actions.SET_CURRENT_LOCALE:
      return extend(affilcoinState, {
        currentLocale: action.value.locale,
      })

    case actions.SET_PENDING_TOKENS:
      return extend(affilcoinState, {
        pendingTokens: { ...action.payload },
      })

    case actions.CLEAR_PENDING_TOKENS: {
      return extend(affilcoinState, {
        pendingTokens: {},
      })
    }

    case actions.UPDATE_PREFERENCES: {
      return extend(affilcoinState, {
        preferences: {
          ...affilcoinState.preferences,
          ...action.payload,
        },
      })
    }

    case actions.COMPLETE_ONBOARDING: {
      return extend(affilcoinState, {
        completedOnboarding: true,
      })
    }

    case actions.SET_FIRST_TIME_FLOW_TYPE: {
      return extend(affilcoinState, {
        firstTimeFlowType: action.value,
      })
    }

    case actions.SET_NEXT_NONCE: {
      return extend(affilcoinState, {
        nextNonce: action.value,
      })
    }

    default:
      return affilcoinState

  }
}
