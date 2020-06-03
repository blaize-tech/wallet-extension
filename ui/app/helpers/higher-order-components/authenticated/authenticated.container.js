import { connect } from 'react-redux'
import Authenticated from './authenticated.component'

const mapStateToProps = state => {
  const { affilcoin: { isUnlocked, completedOnboarding } } = state

  return {
    isUnlocked,
    completedOnboarding,
  }
}

export default connect(mapStateToProps)(Authenticated)
