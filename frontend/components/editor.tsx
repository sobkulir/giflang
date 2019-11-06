import * as Comlink from 'comlink'
import * as React from 'react'
import Worker from 'worker-loader!../../interpreter/giflang.worker'
import { GiflangWorker } from '../../interpreter/giflang.worker'
import * as styles from './editor.scss'
import LetterPicker from './letter-picker'
import TextArea from './text-area'

export class Editor extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props)
  }
  async worker() {
    // const x = new XWorker()
    const cecky =
      Comlink.wrap<new () => Promise<GiflangWorker>>(new Worker())
    const x = await new cecky()
    // console.log(await x.getCounter())
    await x.run('P;R;I;N;T;LPAR;5;RPAR;SEMICOLON;')
  }
  render() {
    this.worker()
    return (
      <div className={styles.editor}>
        <TextArea />
        <LetterPicker />
      </div>
    )
  }
}

