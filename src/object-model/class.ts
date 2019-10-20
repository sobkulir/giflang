import { Interpreter } from '../interpreter'
import { Instance, ObjectInstance, UserFunctionInstance, WrappedFunctionInstance } from './instance'
import { Natives } from './natives'
import { StringInstance } from './std/string-instance'

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

  addNativeMethod(
    name: string,
    method: (
      interpreter: Interpreter,
      args: Instance[],
    ) => Instance,
    wrappedFunctionClass: WrappedFunctionClass,
  ) {
    this.fields.set(
      name,
      new WrappedFunctionInstance(
        wrappedFunctionClass,
        (interpreter: Interpreter, args: Instance[]) => {
          return method(interpreter, args)
        },
      ),
    )
  }
}

class MetaClass extends Class {
  // Does not set base to Object.
  constructor() {
    super(null, nameof(MetaClass), null)
    this.klass = this
  }

  // TODO: Implement __call__: calls "createBlankInstance" and calls __init__.
}

class WrappedFunctionClass extends Class {
  static __call__(
    interpreter: Interpreter,
    args: Instance[],
  ): Instance {
    // TODO: Check args length.
    const self = args[0].castOrThrow(WrappedFunctionInstance)
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
      this
    )
  }
}

class ObjectClass extends Class {
  static __str__(
    _interpreter: Interpreter,
    args: Instance[]
  ): StringInstance {
    // TODO: Check arity.
    const _self = args[0].castOrThrow(ObjectInstance)
    return Natives.getInstance()
      .createString('Object instance of class TODO at id TODO.')
  }

  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(ObjectClass), /* base = */ null)
  }

  createBlankUserInstance(): ObjectInstance {
    return new ObjectInstance(this)
  }
}

class NoneClass extends Class {
  private instance: ObjectInstance
  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(NoneClass), /* base = */ metaClass.base)
    this.instance = new ObjectInstance(this)
  }

  createBlankUserInstance(): ObjectInstance {
    return this.instance
  }
}

class UserFunctionClass extends Class {
  static __call__(
    interpreter: Interpreter,
    args: Instance[],
  ) {
    // TODO: Check args length.
    const self = args[0].castOrThrow(UserFunctionInstance)
    return self.call(interpreter, args.slice(1))
  }

  constructor(
    metaClass: MetaClass,
    wrappedFunctionClass: WrappedFunctionClass,
  ) {
    super(metaClass, nameof(UserFunctionClass), metaClass.base as ObjectClass)

    this.addNativeMethod(
      '__call__',
      UserFunctionClass.__call__,
      wrappedFunctionClass,
    )
  }
}
export { Class, MetaClass, WrappedFunctionClass, UserFunctionClass, NoneClass, ObjectClass }

