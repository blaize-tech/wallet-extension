import { connect } from 'react-redux'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import {
  toggleAccountMenu,
  showAccountDetail,
  hideSidebar,
  lockAffilcoin,
  hideWarning,
  showConfigPage,
  showInfoPage,
  showModal,
} from '../../../store/actions'
import { getAffilcoinAccounts } from '../../../selectors/selectors'
import AccountMenu from './account-menu.component'

function mapStateToProps (state) {
  const { affilcoin: { selectedAddress, isAccountMenuOpen, keyrings, identities } } = state

  return {
    selectedAddress,
    isAccountMenuOpen,
    keyrings,
    identities,
    accounts: getAffilcoinAccounts(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    toggleAccountMenu: () => dispatch(toggleAccountMenu()),
    showAccountDetail: address => {
      dispatch(showAccountDetail(address))
      dispatch(hideSidebar())
      dispatch(toggleAccountMenu())
    },
    lockAffilcoin: () => {
      dispatch(lockAffilcoin())
      dispatch(hideWarning())
      dispatch(hideSidebar())
      dispatch(toggleAccountMenu())
    },
    showConfigPage: () => {
      dispatch(showConfigPage())
      dispatch(hideSidebar())
      dispatch(toggleAccountMenu())
    },
    showInfoPage: () => {
      dispatch(showInfoPage())
      dispatch(hideSidebar())
      dispatch(toggleAccountMenu())
    },
    showRemoveAccountConfirmationModal: identity => {
      return dispatch(showModal({ name: 'CONFIRM_REMOVE_ACCOUNT', identity }))
    },
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(AccountMenu)
