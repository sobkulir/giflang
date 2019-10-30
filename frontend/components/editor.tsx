import * as React from 'react'
import { Alphabet } from '../alphabet'
import * as styles from './editor.scss'

interface State {
}
interface Props {
}

type VideoRow = Alphabet[]
type VideoText = VideoRow[]
type VideoMapping = Map<Alphabet, string>

interface VideoRowCompProps {
  videos: VideoRow
  mapping: VideoMapping
}

const VideoRowComp: React.SFC<VideoRowCompProps> = (props) => {
  const row = props.videos.map((letter) =>
    <div className={styles.videoWrapper}>
      <video
        muted autoPlay loop src={`/img/${props.mapping.get(letter)}`} />
    </div>)
  return (
    <div>
      {row}
    </div>
  )
}

class Editor extends React.Component<Props, State> {
  text: VideoText = [

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],

    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
    [Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B, Alphabet.A, Alphabet.B],
  ]
  mapping: VideoMapping = new Map(
    [
      [Alphabet.A, 'small.webm'],
      [Alphabet.B, 'small.webm']
    ])

  render() {
    return this.text.map(
      (videoRow) => <VideoRowComp videos={videoRow} mapping={this.mapping} />)
  }
}

export { Editor }

