const assert = require('assert')
const freeze = require('deep-freeze-strict')
const path = require('path')

const actions = require(path.join(__dirname, '..', '..', '..', 'ui', 'app', 'store', 'actions.js'))
const reducers = require(path.join(__dirname, '..', '..', '..', 'ui', 'app', 'ducks', 'index.js'))

describe('SET_ACCOUNT_LABEL', function () {
  it('updates the state.affilcoin.identities[:i].name property of the state to the action.value.label', function () {
    const initialState = {
      affilcoin: {
        identities: {
          foo: {
            name: 'bar',
          },
        },
      },
    }
    freeze(initialState)

    const action = {
      type: actions.SET_ACCOUNT_LABEL,
      value: {
        account: 'foo',
        label: 'baz',
      },
    }
    freeze(action)

    const resultingState = reducers(initialState, action)
    assert.equal(resultingState.affilcoin.identities.foo.name, action.value.label)
  })
})

