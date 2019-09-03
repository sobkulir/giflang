import { Class } from './class'
import { MetaClass } from './meta-class'
import { WrappedFunctionInstance } from './wrapped-function-instance'
import { Interpreter } from '../interpreter'
import { Instance } from './instance'

class WrappedFunctionClass extends Class {
  static __call__(
    interpreter: Interpreter,
    self: WrappedFunctionInstance,
    args: Instance[],
  ) {
    return self.call(interpreter, args.slice(1))
  }

  /* Next up: Make Instance.InstantiateClass(klass) instantiate this
              instanceType. */
  static nativeInstanceType = WrappedFunctionInstance

  constructor(metaClass: MetaClass) {
    super(metaClass, metaClass.base)
    this.addNativeMethod(
      '__call__',
      WrappedFunctionClass.__call__,
      this,
      WrappedFunctionInstance,
    )
  }
}

export { WrappedFunctionClass }
