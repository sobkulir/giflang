import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { connect } from 'react-redux'
import { stringToSigns } from '../lib/text-area'
import { LetterSize, SignToGifMap } from '../types/ide'
import { State } from '../types/redux'
import { Content } from './text-area/content'

export interface DocsProps {
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

const Docs: React.SFC<DocsProps> = (props: DocsProps) => {
  const listing = (s: string) => {
    return (
      <Content
        text={stringToSigns(s)}
        letterSize={props.letterSize}
        signToGifMap={props.signToGifMap}
      />)
  }
  return (
    <Container maxWidth="lg">
      <Paper elevation={1} style={{ padding: 20 }} >
        <Typography variant="h2">Giflang docs</Typography>
        <br />
        <Typography variant="body1">
          Giflang is very similar to Python as it is a dynamically-typed object-oriented language with
          support for magic methods. However, Giflang separates statements with semicolons and blocks
          are not delimited with indentation as in Python.
        </Typography>
        <br /><br />
        <Typography variant="h4">Assignment and I/O</Typography>
        <br />
        <Typography variant="body1">
          Below is a Hello World example demonstrating print function.
        </Typography>
        {listing('XX')}
      </Paper>
    </Container >
  )
}

export default connect(
  (state: State) => ({
    signToGifMap: state.ide.signToGifMap,
    letterSize: state.ide.letterSize,
  })
)(Docs)
