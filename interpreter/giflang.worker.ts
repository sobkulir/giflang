import * as Comlink from 'comlink'
import { Interpreter, NextStepFunction } from './interpreter'
import { PrintFunction } from './object-model/std/functions'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): void
}

export interface GiflangSetup {
  onPrint: PrintFunction,
  onFinish: (error?: string) => void,
  onNextStep: NextStepFunction,
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
