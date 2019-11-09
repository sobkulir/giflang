import * as Comlink from 'comlink'
import Worker from 'worker-loader!../../interpreter/giflang.worker'
import { GiflangWorker } from '../../interpreter/giflang.worker'
import { PrintFunction } from '../../interpreter/object-model/std/functions'
import { Text } from '../redux/editor/types'
import { Sign } from './sign'


function TextToString(text: Text): string {
  return text.map(
    (row) => row.letters.map((letter) => `${Sign[letter.sign]};`).join('')
  ).join('\n')
}

async function ExecuteCode(print: PrintFunction, code: string) {
  const workerCreator =
    Comlink.wrap<
      new (print: PrintFunction) => Promise<GiflangWorker>>(new Worker())
  const worker = await new workerCreator(Comlink.proxy(print))
  // console.log(await x.getCounter())
  await worker.run(code)
}

export { TextToString, ExecuteCode }

