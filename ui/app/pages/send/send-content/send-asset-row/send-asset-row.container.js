import { connect } from 'react-redux'
import SendAssetRow from './send-asset-row.component'
import {getAffilcoinAccounts} from '../../../../selectors/selectors'
import { setSelectedToken } from '../../../../store/actions'

function mapStateToProps (state) {
  return {
    tokens: state.affilcoin.tokens,
    selectedAddress: state.affilcoin.selectedAddress,
    selectedTokenAddress: state.affilcoin.selectedTokenAddress,
    accounts: getAffilcoinAccounts(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setSelectedToken: address => dispatch(setSelectedToken(address)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendAssetRow)
