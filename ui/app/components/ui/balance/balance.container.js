import { connect } from 'react-redux'
import Balance from './balance.component'
import {
  getNativeCurrency,
  getAssetImages,
  conversionRateSelector,
  getCurrentCurrency,
  getAffilcoinAccounts,
  getIsMainnet,
  preferencesSelector,
} from '../../../selectors/selectors'

const mapStateToProps = state => {
  const { showFiatInTestnets } = preferencesSelector(state)
  const isMainnet = getIsMainnet(state)
  const accounts = getAffilcoinAccounts(state)
  const network = state.affilcoin.network
  const selectedAddress = state.affilcoin.selectedAddress || Object.keys(accounts)[0]
  const account = accounts[selectedAddress]

  return {
    account,
    network,
    nativeCurrency: getNativeCurrency(state),
    conversionRate: conversionRateSelector(state),
    currentCurrency: getCurrentCurrency(state),
    assetImages: getAssetImages(state),
    showFiat: (isMainnet || !!showFiatInTestnets),
  }
}

export default connect(mapStateToProps)(Balance)
