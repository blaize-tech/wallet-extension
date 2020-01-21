import { connect } from 'react-redux'
import FirstTimeFlowSwitch from './first-time-flow-switch.component'

const mapStateToProps = ({ affilcoin }) => {
  const {
    completedOnboarding,
    isInitialized,
    isUnlocked,
    participateInMetaMetrics: optInMetaMetrics,
  } = affilcoin

  return {
    completedOnboarding,
    isInitialized,
    isUnlocked,
    optInMetaMetrics,
  }
}

export default connect(mapStateToProps)(FirstTimeFlowSwitch)
