const extend = require('xtend')
const actions = require('../../store/actions')

module.exports = reduceAffilcoin

function reduceAffilcoin (state, action) {
  const localeMessagesState = extend({}, state.localeMessages)

  switch (action.type) {
    case actions.SET_CURRENT_LOCALE:
      return extend(localeMessagesState, {
        current: action.value.messages,
      })
    default:
      return localeMessagesState
  }
}
