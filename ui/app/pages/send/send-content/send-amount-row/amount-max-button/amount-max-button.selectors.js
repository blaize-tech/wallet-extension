const selectors = {
  getMaxModeOn,
}

module.exports = selectors

function getMaxModeOn (state) {
  return state.affilcoin.send.maxModeOn
}
