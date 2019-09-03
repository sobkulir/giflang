import { Class } from './class'
import { MetaClass } from './meta-class'
import { Instance } from './instance'
import { UserFunctionInstance } from './user-function-instance'
import { WrappedFunctionInstance } from './wrapped-function-instance'
import { WrappedFunctionClass } from './wrapped-function-class'
import { Interpreter } from '../interpreter'

class UserFunctionClass extends Class {
  constructor(
    metaClass: MetaClass,
    wrappedFunctionClass: WrappedFunctionClass,
  ) {
    super(metaClass, metaClass.base)
    this.fields.set(
      '__call__',
      new WrappedFunctionInstance(
        wrappedFunctionClass,
        (interpreter: Interpreter, args: Instance[]) => {
          if (args.length === 0) {
            throw Error('TODO: Requires at least 1 argument')
          }
          const callee = args[0]
          if (callee instanceof UserFunctionInstance) {
            return callee.call(interpreter, args.slice(1))
          } else {
            throw Error(
              'TODO: First argument must be instance of UserFunction.',
            )
          }
        },
      ),
    )
  }
}

export { UserFunctionClass }
