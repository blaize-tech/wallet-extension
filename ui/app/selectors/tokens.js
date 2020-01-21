import { createSelector } from 'reselect'

export const selectedTokenAddressSelector = state => state.affilcoin.selectedTokenAddress
export const tokenSelector = state => state.affilcoin.tokens
export const selectedTokenSelector = createSelector(
  tokenSelector,
  selectedTokenAddressSelector,
  (tokens = [], selectedTokenAddress = '') => {
    return tokens.find(({ address }) => address === selectedTokenAddress)
  }
)
