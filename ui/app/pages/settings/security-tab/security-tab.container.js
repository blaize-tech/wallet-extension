import SecurityTab from './security-tab.component'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  displayWarning,
  revealSeedConfirmation,
  setFeatureFlag,
  setParticipateInMetaMetrics,
} from '../../../store/actions'

const mapStateToProps = state => {
  const { appState: { warning }, affilcoin } = state
  const {
    featureFlags: {
      showIncomingTransactions,
    } = {},
    participateInMetaMetrics,
  } = affilcoin

  return {
    warning,
    showIncomingTransactions,
    participateInMetaMetrics,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayWarning: warning => dispatch(displayWarning(warning)),
    revealSeedConfirmation: () => dispatch(revealSeedConfirmation()),
    setParticipateInMetaMetrics: (val) => dispatch(setParticipateInMetaMetrics(val)),
    setShowIncomingTransactionsFeatureFlag: shouldShow => dispatch(setFeatureFlag('showIncomingTransactions', shouldShow)),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(SecurityTab)
