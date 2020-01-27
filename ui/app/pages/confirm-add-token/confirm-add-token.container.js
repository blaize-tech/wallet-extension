import { connect } from 'react-redux'
import ConfirmAddToken from './confirm-add-token.component'

const { addTokens, clearPendingTokens } = require('../../store/actions')

const mapStateToProps = ({ affilcoin }) => {
  const { pendingTokens } = affilcoin
  return {
    pendingTokens,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addTokens: tokens => dispatch(addTokens(tokens)),
    clearPendingTokens: () => dispatch(clearPendingTokens()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmAddToken)
