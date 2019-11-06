import * as Comlink from 'comlink'
import * as React from 'react'
import { connect } from 'react-redux'
import Worker from 'worker-loader!../../interpreter/giflang.worker'
import { GiflangWorker } from '../../interpreter/giflang.worker'
import { TextToString } from '../lib/editor'
import { Text } from '../redux/editor/types'
import { State } from '../redux/types'

interface MenuProps {
  text: Text
}

class Menu extends React.Component<MenuProps, {}> {
  async worker(code: string) {
    // const x = new XWorker()
    const cecky =
      Comlink.wrap<new () => Promise<GiflangWorker>>(new Worker())
    const x = await new cecky()
    // console.log(await x.getCounter())
    await x.run(code)
  }

  executeCode = (_: any) => {
    const str = TextToString(this.props.text)
    console.log(str)
    this.worker(str)
  }
  render() {
    return (
      <button onClick={this.executeCode}>Run</button>
    )
  }
}

export default connect(
  (state: State) => ({
    text: state.editor.text,
  }))(Menu)

