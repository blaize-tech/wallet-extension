const { createStore, applyMiddleware } = require('redux')
const { default: thunkMiddleware } = require('redux-thunk')
const { composeWithDevTools } = require('remote-redux-devtools')
const rootReducer = require('../ducks')

module.exports = function configureStore (initialState) {
  const composeEnhancers = composeWithDevTools({
    name: 'Affilcoin',
    hostname: 'localhost',
    port: 8000,
    realtime: Boolean(process.env.AFFILCOIN_DEBUG),
  })
  return createStore(rootReducer, initialState, composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
    ),
  ))
}
