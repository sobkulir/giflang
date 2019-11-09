import * as Comlink from 'comlink'
import { Interpreter } from './interpreter'
import { PrintFunction } from './object-model/std/functions'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): void
}

class Giflang implements GiflangWorker {
  readonly interpreter: Interpreter
  constructor(print: PrintFunction) {
    this.interpreter = new Interpreter(print)
  }
  run(code: string) {
    const rootNode = ParseGiflang(code)
    try {
      this.interpreter.visitProgramStmt(rootNode)
    } finally {
      console.log(this.interpreter.callStack)
    }
  }
}

export default {} as typeof Worker & (new () => Worker)

Comlink.expose(Giflang)
