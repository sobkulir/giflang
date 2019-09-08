import { Class } from './class'
import { MetaClass } from './meta-class'
import {
  TWrappedFunction,
  WrappedFunctionInstance
} from './wrapped-function-instance'
import { Interpreter } from '../interpreter'
import { Instance } from './instance'
import { ObjectClass } from './object-class'

class WrappedFunctionClass extends Class {
  static __call__(
    interpreter: Interpreter,
    self: WrappedFunctionInstance,
    args: Instance[],
  ) {
    return self.call(interpreter, args.slice(1))
  }

  constructor(metaClass: MetaClass) {
    super(
      metaClass,
      nameof(WrappedFunctionClass),
      metaClass.base as ObjectClass,
    )
    this.addNativeMethod(
      '__call__',
      WrappedFunctionClass.__call__,
      this,
      WrappedFunctionInstance,
    )
  }
}

export { WrappedFunctionClass }
