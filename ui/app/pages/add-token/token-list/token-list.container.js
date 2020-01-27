import { connect } from 'react-redux'
import TokenList from './token-list.component'

const mapStateToProps = ({ affilcoin }) => {
  const { tokens } = affilcoin
  return {
    tokens,
  }
}

export default connect(mapStateToProps)(TokenList)
