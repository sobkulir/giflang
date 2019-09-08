import { Instance } from './instance'
import { Interpreter } from '../interpreter'
import { FunctionInstance } from './function-instance'
import { WrappedFunctionClass } from './wrapped-function-class'
import { ObjectInstance } from './object-instance'
import { ObjectClass } from './object-class'
import { Class } from './class'

type TWrappedFunction = (
  interpreter: Interpreter,
  args: Instance[],
) => Instance

class WrappedFunctionInstance extends FunctionInstance {
  constructor(klass: Class, public wrappedFunction: TWrappedFunction) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type WrappedFunctionClass.
    super(klass)
  }

  call(interpreter: Interpreter, args: Instance[]): Instance {
    // TODO: Check arity.
    return this.wrappedFunction(interpreter, args)
  }
}

export { WrappedFunctionInstance, TWrappedFunction }
