import Typography from '@material-ui/core/Typography'
import * as React from 'react'
import { connect } from 'react-redux'
import { Sign } from '../lib/sign'
import { addSignAfterCursor as _addSignAfterCursor } from '../redux/editor/actions'
import { AlphabetCategory, CategorizedAlphabet, LetterSize, SignToGifMap } from '../redux/editor/types'
import { State } from '../redux/types'
import * as styles from './letter-picker.scss'

interface LetterPickerProps {
  addSignAfterCursor: typeof _addSignAfterCursor
  alphabet: CategorizedAlphabet,
  letterSize: LetterSize,
  signToGifMap: SignToGifMap,
}

interface CategoryProps {
  addSignAfterCursor: typeof _addSignAfterCursor
  category: AlphabetCategory,
  signToGifMap: SignToGifMap,
  letterSize: LetterSize,
  shrinkFactor: number
}

const Category: React.SFC<CategoryProps> = (props) => {
  const getLetterStyles = (letterSize: LetterSize): React.CSSProperties => ({
    width: `${letterSize.edgePx * props.shrinkFactor}px`,
    height: `${letterSize.edgePx * props.shrinkFactor}px`,
    padding: `${letterSize.marginPx * props.shrinkFactor}px`,
  })

  const addSign = (sign: Sign) => () => { props.addSignAfterCursor(sign) }

  const row = props.category.signs.map((sign) =>
    <img
      className={styles.letter}
      key={sign.toString()}
      style={getLetterStyles(props.letterSize)}
      src={`${props.signToGifMap.get(sign)}`}
      onClick={addSign(sign)}
    />)

  return (
    <div className={styles.category}>
      <Typography variant="subtitle1">{props.category.name}</Typography>
      {row}
    </div>
  )
}

class LetterPicker extends React.Component<LetterPickerProps, {}> {
  readonly shrinkFactor: number = 0.8

  getLetterPickerStyles(): React.CSSProperties {
    const originalLetterPx =
      (this.props.letterSize.edgePx + 2 * this.props.letterSize.marginPx)
    const shrinkedLetterPx = this.shrinkFactor * originalLetterPx
    // Accomodate 6 images on a single row
    return {
      width: `${4 * shrinkedLetterPx}px`
    }
  }

  render() {
    const categories = this.props.alphabet.map((category) => (
      <Category
        key={category.name}
        category={category}
        signToGifMap={this.props.signToGifMap}
        letterSize={this.props.letterSize}
        addSignAfterCursor={this.props.addSignAfterCursor}
        shrinkFactor={this.shrinkFactor}
      />
    ))
    // Nested divs are used so that a scrollbar of the outer div
    // does not use width of the inner div.
    return (
      <div className={styles.letterPicker}>
        <div style={this.getLetterPickerStyles()}>
          {categories}
        </div>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    alphabet: state.editor.alphabet,
    signToGifMap: state.editor.signToGifMap,
    letterSize: state.editor.letterSize,
  }),
  {
    addSignAfterCursor: _addSignAfterCursor,
  }
)(LetterPicker)

