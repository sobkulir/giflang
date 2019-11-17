import * as Comlink from 'comlink'
import { Interpreter, InterpreterSetup } from './interpreter'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): Promise<void>
}

export interface GiflangSetup extends InterpreterSetup {
  onFinish: (error?: string) => void,
}

class Giflang implements GiflangWorker {
  readonly interpreter: Interpreter
  constructor(readonly setup: GiflangSetup, isDebugMode: boolean) {
    this.interpreter = new Interpreter(setup, isDebugMode)
  }
  async run(code: string) {
    try {
      const rootNode = ParseGiflang(code)
      await this.interpreter.visitProgramStmt(rootNode)
      this.setup.onFinish()
    } catch (e) {
      console.log(e)
      this.setup.onFinish('Error')
    } finally {
      console.log(this.interpreter.callStack)
    }
  }
}

export default {} as typeof Worker & (new () => Worker)

Comlink.expose(Giflang)
