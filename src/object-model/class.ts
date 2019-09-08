import { Instance } from './instance'
import { ObjectInstance } from './object-instance'
import { Interpreter } from '../interpreter'
import { WrappedFunctionInstance } from './wrapped-function-instance'
import { WrappedFunctionClass } from './wrapped-function-class'
import { MetaClass } from './meta-class'

abstract class Class extends Instance {
  // Nulls for initial bootstrapping.
  constructor(
    klass: MetaClass | null,
    readonly name: string,
    public base: Class | null,
  ) {
    super(klass)
  }

  // Classes that user can derive from (like StringClass) override this method.
  createBlankUserInstance(): Instance {
    throw new Error(`${this.name} cannot be instantiated by client.`)
  }

  has(name: string): boolean {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    return this.fields.has(name) || (this.base != null && this.base.has(name))
  }

  get(name: string): Instance {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    if (this.fields.has(name)) {
      return this.fields.get(name) as Instance
    }

    if (this.base != null && this.base.has(name)) {
      return this.base.get(name)
    }

    // Maybe return null?
    throw Error('TODO')
  }

  addNativeMethod<TFirstArg>(
    name: string,
    method: (
      interpreter: Interpreter,
      self: TFirstArg,
      args: Instance[],
    ) => Instance,
    wrappedFunctionClass: WrappedFunctionClass,
    TFirstArgConstructor: new (...args: any[]) => TFirstArg,
  ) {
    this.fields.set(
      name,
      new WrappedFunctionInstance(
        wrappedFunctionClass,
        (interpreter: Interpreter, args: Instance[]) => {
          if (args.length === 0) {
            throw Error('TODO: Requires at least 1 argument')
          }
          const callee = args[0]
          if (callee instanceof TFirstArgConstructor) {
            return method(interpreter, callee, args.slice(1))
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

export { Class }
