const render = require('react-dom').render
const h = require('react-hyperscript')
const Root = require('./app/pages')
const actions = require('./app/store/actions')
const configureStore = require('./app/store/store')
const txHelper = require('./lib/tx-helper')
const { fetchLocale } = require('./app/helpers/utils/i18n-helper')
import switchDirection from './app/helpers/utils/switch-direction'
const log = require('loglevel')

module.exports = launchAffilcoinUi

log.setLevel(global.AFFILCOIN_DEBUG ? 'debug' : 'warn')

function launchAffilcoinUi (opts, cb) {
  var {backgroundConnection} = opts
  actions._setBackgroundConnection(backgroundConnection)
  // check if we are unlocked first
  backgroundConnection.getState(function (err, affilcoinState) {
    if (err) return cb(err)
    startApp(affilcoinState, backgroundConnection, opts)
      .then((store) => {
        cb(null, store)
      })
  })
}

async function startApp (affilcoinState, backgroundConnection, opts) {
  // parse opts
  if (!affilcoinState.featureFlags) affilcoinState.featureFlags = {}

  const currentLocaleMessages = affilcoinState.currentLocale
    ? await fetchLocale(affilcoinState.currentLocale)
    : {}
  const enLocaleMessages = await fetchLocale('en')

  if (affilcoinState.textDirection === 'rtl') {
    await switchDirection('rtl')
  }

  const store = configureStore({
    activeTab: opts.activeTab,

    // affilcoinState represents the cross-tab state
    affilcoin: affilcoinState,

    // appState represents the current tab's popup state
    appState: {},

    localeMessages: {
      current: currentLocaleMessages,
      en: enLocaleMessages,
    },

    // Which blockchain we are using:
    networkVersion: opts.networkVersion,
  })

  // if unconfirmed txs, start on txConf page
  const unapprovedTxsAll = txHelper(affilcoinState.unapprovedTxs, affilcoinState.unapprovedMsgs, affilcoinState.unapprovedPersonalMsgs, affilcoinState.unapprovedTypedMessages, affilcoinState.network)
  const numberOfUnapprivedTx = unapprovedTxsAll.length
  if (numberOfUnapprivedTx > 0) {
    store.dispatch(actions.showConfTxPage({
      id: unapprovedTxsAll[0].id,
    }))
  }

  backgroundConnection.on('update', function (affilcoinState) {
    const currentState = store.getState()
    const { currentLocale } = currentState.affilcoin
    const { currentLocale: newLocale } = affilcoinState

    if (currentLocale && newLocale && currentLocale !== newLocale) {
      store.dispatch(actions.updateCurrentLocale(newLocale))
    }

    store.dispatch(actions.updateAffilcoinState(affilcoinState))
  })

  // global affilcoin api - used by tooling
  global.affilcoin = {
    updateCurrentLocale: (code) => {
      store.dispatch(actions.updateCurrentLocale(code))
    },
    setProviderType: (type) => {
      store.dispatch(actions.setProviderType(type))
    },
    setFeatureFlag: (key, value) => {
      store.dispatch(actions.setFeatureFlag(key, value))
    },
  }

  // start app
  render(
    h(Root, {
      // inject initial state
      store: store,
    }
    ), opts.container)

  return store
}
