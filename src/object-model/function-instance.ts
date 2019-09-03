import { Interpreter } from '../interpreter'
import { Instance } from './instance'

interface FunctionInstance {
  call(interpreter: Interpreter, args: Instance[]): Instance
}

export { FunctionInstance }
