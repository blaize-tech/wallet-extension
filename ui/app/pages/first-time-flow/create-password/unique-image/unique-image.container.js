import { connect } from 'react-redux'
import UniqueImage from './unique-image.component'

const mapStateToProps = ({ affilcoin }) => {
  const { selectedAddress } = affilcoin

  return {
    address: selectedAddress,
  }
}

export default connect(mapStateToProps)(UniqueImage)
