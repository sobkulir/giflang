import * as Comlink from 'comlink'
import { Interpreter } from './interpreter'
import { PrintFunction } from './object-model/std/functions'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): void
}

export interface GiflangWorkerCallbacks {
  onPrint: PrintFunction,
  onFinish: (error?: string) => void
}

class Giflang implements GiflangWorker {
  readonly interpreter: Interpreter
  constructor(readonly callbacks: GiflangWorkerCallbacks) {
    this.interpreter = new Interpreter(callbacks.onPrint)
  }
  run(code: string) {
    try {
      const rootNode = ParseGiflang(code)
      this.interpreter.visitProgramStmt(rootNode)
      this.callbacks.onFinish()
    } catch (e) {
      console.log(e)
      this.callbacks.onFinish('Error')
    } finally {
      console.log(this.interpreter.callStack)
    }
  }
}

export default {} as typeof Worker & (new () => Worker)

Comlink.expose(Giflang)
