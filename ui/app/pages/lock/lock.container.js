import Lock from './lock.component'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { lockAffilcoin } from '../../store/actions'

const mapStateToProps = state => {
  const { affilcoin: { isUnlocked } } = state

  return {
    isUnlocked,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    lockAffilcoin: () => dispatch(lockAffilcoin()),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Lock)
