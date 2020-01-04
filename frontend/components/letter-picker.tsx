
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { connect } from 'react-redux'
import { Sign } from '~/interpreter/ast/sign'
import { addSignAfterFocusedCursor } from '../actions/text-area'
import { AlphabetCategory, CategorizedAlphabet, LetterSize, SignToGifMap } from '../types/ide'
import { State } from '../types/redux'
import * as styles from './letter-picker.scss'

interface LetterPickerProps {
  addSignAfterFocusedCursor: typeof addSignAfterFocusedCursor
  alphabet: CategorizedAlphabet,
  letterSize: LetterSize,
  signToGifMap: SignToGifMap,
}

interface CategoryProps {
  addSignAfterFocusedCursor: typeof addSignAfterFocusedCursor
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

  const addSign = (sign: Sign) => () => {
    props.addSignAfterFocusedCursor(sign)
  }

  const row = props.category.signs.map((labeledSign) =>
    <img
      key={labeledSign.sign.toString()}
      className={styles.letter}
      style={getLetterStyles(props.letterSize)}
      src={`${props.signToGifMap.get(labeledSign.sign)}`}
      onClick={addSign(labeledSign.sign)}
      title={labeledSign.label}
    />)

  return (
    <div className={styles.category}>
      <Typography variant="subtitle1">{props.category.name}</Typography>
      {row}
    </div>
  )
}

class LetterPicker extends React.Component<LetterPickerProps, {}> {
  readonly shrinkFactor: number = 0.9

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
        addSignAfterFocusedCursor={this.props.addSignAfterFocusedCursor}
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
    alphabet: state.ide.alphabet,
    signToGifMap: state.ide.signToGifMap,
    letterSize: state.ide.letterSize,
  }),
  {
    addSignAfterFocusedCursor,
  }
)(LetterPicker)

