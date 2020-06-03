const {
  getMetaMetricState,
} = require('../../../ui/app/selectors/selectors')
const {
  sendMetaMetricsEvent,
} = require('../../../ui/app/helpers/utils/metametrics.util')

const inDevelopment = process.env.NODE_ENV === 'development'

const METAMETRICS_TRACKING_URL = inDevelopment
  ? 'http://www.affilcoin.com/metametrics'
  : 'http://www.affilcoin.com/metametrics-prod'

function backEndMetaMetricsEvent (metaMaskState, eventData) {
  const stateEventData = getMetaMetricState({ affilcoin: metaMaskState })

  if (stateEventData.participateInMetaMetrics) {
    sendMetaMetricsEvent({
      ...stateEventData,
      ...eventData,
      url: METAMETRICS_TRACKING_URL + '/backend',
    })
  }
}

module.exports = backEndMetaMetricsEvent
