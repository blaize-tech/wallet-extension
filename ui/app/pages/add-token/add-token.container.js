import { connect } from 'react-redux'
import AddToken from './add-token.component'

const { setPendingTokens, clearPendingTokens } = require('../../store/actions')

const mapStateToProps = ({ affilcoin }) => {
  const { identities, tokens, pendingTokens } = affilcoin
  return {
    identities,
    tokens,
    pendingTokens,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setPendingTokens: tokens => dispatch(setPendingTokens(tokens)),
    clearPendingTokens: () => dispatch(clearPendingTokens()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddToken)
