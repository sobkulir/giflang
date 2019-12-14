import * as Comlink from 'comlink'
import { Interpreter, InterpreterSetup } from './interpreter'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): void
  resolveNextStep(): void
}

export interface GiflangSetup extends InterpreterSetup {
  onFinish: (error: string) => void,
}

class Giflang implements GiflangWorker {
  readonly interpreter: Interpreter
  constructor(readonly setup: GiflangSetup, isDebugMode: boolean) {
    this.interpreter = new Interpreter(setup, isDebugMode)
  }
  run(code: string) {
    setTimeout(() => {
      try {
        const rootNode = ParseGiflang(code)
        this.interpreter.visitProgramStmt(rootNode)
        this.setup.onFinish('')
      } catch (e) {
        this.setup.onFinish(`${e.toString()}`)
      }
    })
  }

  resolveNextStep() {
    this.interpreter.resolveNextStep()
  }
}

export default {} as typeof Worker & (new () => Worker)

Comlink.expose(Giflang)
