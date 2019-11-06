import * as Comlink from 'comlink'
import { Interpreter } from './interpreter'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): void
}

class Giflang implements GiflangWorker {
  readonly interpreter: Interpreter
  constructor() {
    this.interpreter = new Interpreter((str) => console.log(str))
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

Comlink.expose(Giflang)
