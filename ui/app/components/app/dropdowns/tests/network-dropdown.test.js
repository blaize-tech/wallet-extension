import React from 'react'
import assert from 'assert'
import { createMockStore } from 'redux-test-utils'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import NetworkDropdown from '../network-dropdown'
import { DropdownMenuItem } from '../components/dropdown'
import NetworkDropdownIcon from '../components/network-dropdown-icon'

describe('Network Dropdown', () => {
  let wrapper

  describe('NetworkDropdown in appState in false', () => {
    const mockState = {
      affilcoin: {
        provider: {
          type: 'test',
        },
      },
      appState: {
        networkDropdown: false,
      },
    }

    const store = createMockStore(mockState)

    beforeEach(() => {
      wrapper = mountWithRouter(
        <NetworkDropdown store={store} />
      )
    })

    it('checks for network droppo class', () => {
      assert.equal(wrapper.find('.network-droppo').length, 1)
    })

    it('renders only one child when networkDropdown is false in state', () => {
      assert.equal(wrapper.children().length, 1)
    })

  })

  describe('NetworkDropdown in appState is true', () => {
    const mockState = {
      affilcoin: {
        provider: {
          'type': 'test',
        },
        frequentRpcListDetail: [
          { rpcUrl: 'http://localhost:7545' },
        ],
      },
      appState: {
        'networkDropdownOpen': true,
      },
    }
    const store = createMockStore(mockState)

    beforeEach(() => {
      wrapper = mountWithRouter(
        <NetworkDropdown store={store}/>,
      )
    })

    it('renders 7 DropDownMenuItems ', () => {
      assert.equal(wrapper.find(DropdownMenuItem).length, 8)
    })

    it('checks background color for first NetworkDropdownIcon', () => {
      assert.equal(wrapper.find(NetworkDropdownIcon).at(0).prop('backgroundColor'), '#29B6AF') // Main Ethereum Network Teal
    })

    it('checks background color for fourth NetworkDropdownIcon', () => {
      assert.equal(wrapper.find(NetworkDropdownIcon).at(3).prop('backgroundColor'), '#f6c343') // Rinkeby Yellow
    })

  })
})
