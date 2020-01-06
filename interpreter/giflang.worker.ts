import * as Comlink from 'comlink'
import { InputBarrier, SteppingBarrier } from './barrier'
import { Interpreter, InterpreterSetup, NextStepFunction } from './interpreter'
import { InputFunction, PrintFunction } from './object-model/functions'
import { ParseGiflang } from './parser'

export interface GiflangWorker {
  run(code: string): void
}

export interface GiflangClbks {
  onFinish: (error: string) => void
  onNextStep: NextStepFunction
  onPrint: PrintFunction
  onInput: () => void
}

// Buffers that are used to synchronize the UI and the interpreter.
export interface GiflangBuffers {
  stepperFlag: Int32Array
  inputSize: Int32Array
  inputChars: Uint8Array
}

class Giflang implements GiflangWorker {
  readonly interpreter: Interpreter

  constructor(readonly clbks: GiflangClbks,
    buffers: GiflangBuffers, isDebugMode: boolean) {
    const stepperBarrier = new SteppingBarrier(buffers.stepperFlag)
    const inputBarrier = new InputBarrier({
      sizeBuffer: buffers.inputSize,
      charBuffer: buffers.inputChars
    })
    const onInput: InputFunction = () => {
      inputBarrier.reset()
      clbks.onInput()
      const s = inputBarrier.wait()
      return s
    }
    const interpreterSetup: InterpreterSetup =
      { onNextStep: clbks.onNextStep, onPrint: clbks.onPrint, onInput }
    this.interpreter = new Interpreter(
      interpreterSetup, (isDebugMode) ? stepperBarrier : undefined)
  }

  run(code: string) {
    try {
      const rootNode = ParseGiflang(code)
      this.interpreter.visitProgramStmt(rootNode)
      this.clbks.onFinish('')
    } catch (e) {
      this.clbks.onFinish(`${e.toString()}`)
    }
  }
}

export default {} as typeof Worker & (new () => Worker)

Comlink.expose(Giflang)
