import { Instance } from './instance'
import { Interpreter } from '../interpreter'
import { FunctionInstance } from './function-instance'
import { WrappedFunctionClass } from './wrapped-function-class'
import { ObjectInstance } from './object-instance'
import { ObjectClass } from './object-class'

class WrappedFunctionInstance extends ObjectInstance
  implements FunctionInstance {
  constructor(
    wrappedFunctionClass: WrappedFunctionClass,
    readonly wrappedFunction: (
      interpreter: Interpreter,
      args: Instance[],
    ) => Instance,
  ) {
    super(wrappedFunctionClass.base as ObjectClass)
  }

  call(interpreter: Interpreter, args: Instance[]): Instance {
    // TODO: Check arity.
    return this.wrappedFunction(interpreter, args)
  }
}

export { WrappedFunctionInstance }
