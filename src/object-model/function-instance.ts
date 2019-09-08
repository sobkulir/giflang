import { Interpreter } from '../interpreter'
import { Instance } from './instance'
import { ObjectInstance } from './object-instance'

abstract class FunctionInstance extends ObjectInstance {
  abstract call(interpreter: Interpreter, args: Instance[]): Instance
}

export { FunctionInstance }
