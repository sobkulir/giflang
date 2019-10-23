import { CodeExecuter } from '../code-executer'
import { BoolInstance, Instance, NoneInstance, ObjectInstance, StringInstance, TWrappedFunction, UserFunctionInstance, WrappedFunctionInstance } from './instance'
import { MagicMethods } from './magic-methods'

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

  addNativeMethods(
    methods: Array<[string, TWrappedFunction]>,
    wrappedFunctionClass: WrappedFunctionClass
  ) {
    for (const m of methods) {
      this.fields.set(
        m[0],
        new WrappedFunctionInstance(
          wrappedFunctionClass,
          (interpreter: CodeExecuter, args: Instance[]) => {
            return m[1](interpreter, args)
          },
        ),
      )
    }
  }
}

class MetaClass extends Class {
  private constructor() {
    super(/* klass = */ null, nameof(MetaClass), /* base = */ null)
  }

  private static instance: MetaClass
  static get(): MetaClass {
    if (!MetaClass.instance) {
      MetaClass.instance = new MetaClass()
      MetaClass.instance.klass = MetaClass.instance
      MetaClass.instance.base = ObjectClass.get()
    }
    return MetaClass.instance
  }
  // TODO: Implement __call__: calls "createBlankInstance" and calls __init__.
}

class ObjectClass extends Class {
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    // TODO: Check arity.
    const _self = args[0].castOrThrow(ObjectInstance)
    return new StringInstance(StringClass.get(), 'achjo')
  }

  private constructor() {
    super(/* klass = */ null, nameof(ObjectClass), /* base = */ null)
  }

  private static instance: ObjectClass
  static get(): ObjectClass {
    if (!ObjectClass.instance) {
      ObjectClass.instance = new ObjectClass()
      ObjectClass.instance.klass = MetaClass.get()
    }
    return ObjectClass.instance
  }

  createBlankUserInstance(): ObjectInstance {
    return new ObjectInstance(this)
  }
}

class BoolClass extends Class {
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    // TODO: Check arity.
    const self = args[0]
    let str = ''
    if (self === BoolInstance.getTrue()) {
      str = 'True'
    }
    else if (self === BoolInstance.getFalse()) {
      str = 'False'
    }
    else {
      throw new Error('TODO: __str__ expected bool.')
    }
    return new StringInstance(StringClass.get(), str)
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): BoolInstance {
    // TODO: Check this!! Arity and type.
    const self = args[0] as BoolInstance
    return self
  }

  private constructor() {
    super(MetaClass.get(), nameof(NoneClass), ObjectClass.get())
    this.addNativeMethods(
      [
        [MagicMethods.__str__, BoolClass.__str__],
        [MagicMethods.__bool__, BoolClass.__bool__],
      ],

      WrappedFunctionClass.get())
  }
  private static instance: BoolClass
  static get(): BoolClass {
    if (!BoolClass.instance) {
      BoolClass.instance = new BoolClass()
    }
    return BoolClass.instance
  }
}

class WrappedFunctionClass extends Class {
  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    // TODO: Check args length.
    const self = args[0].castOrThrow(WrappedFunctionInstance)
    return self.call(interpreter, args.slice(1))
  }

  private constructor() {
    super(
      MetaClass.get(),
      nameof(WrappedFunctionClass),
      ObjectClass.get(),
    )
    this.addNativeMethods(
      [['__call__', WrappedFunctionClass.__call__]],
      this
    )
  }

  private static instance: WrappedFunctionClass
  static get(): WrappedFunctionClass {
    if (!WrappedFunctionClass.instance) {
      WrappedFunctionClass.instance = new WrappedFunctionClass()
    }
    return WrappedFunctionClass.instance
  }
}

class NoneClass extends Class {
  // TODO: Forbid deriving from None, Bool, ...
  private constructor() {
    super(MetaClass.get(), nameof(NoneClass), ObjectClass.get())
  }
  private static instance: NoneClass
  static get(): NoneClass {
    if (!NoneClass.instance) {
      NoneClass.instance = new NoneClass()
    }
    return NoneClass.instance
  }

  createBlankUserInstance(): NoneInstance {
    return NoneInstance.getInstance()
  }
}

class UserFunctionClass extends Class {
  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ) {
    // TODO: Check args length.
    const self = args[0].castOrThrow(UserFunctionInstance)
    return self.call(interpreter, args.slice(1))
  }

  private constructor() {
    super(MetaClass.get(), nameof(UserFunctionClass), ObjectClass.get())

    this.addNativeMethods(
      [['__call__', UserFunctionClass.__call__]],
      WrappedFunctionClass.get()
    )
  }

  private static instance: UserFunctionClass
  static get(): UserFunctionClass {
    if (!UserFunctionClass.instance) {
      UserFunctionClass.instance = new UserFunctionClass()
    }
    return UserFunctionClass.instance
  }
}

class StringClass extends Class {
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    // TODO: Check arity.
    const self = args[0].castOrThrow(StringInstance)
    return self
  }

  private constructor() {
    super(MetaClass.get(), nameof(StringClass), ObjectClass.get())
  }
  private static instance: StringClass
  static get(): StringClass {
    if (!StringClass.instance) {
      StringClass.instance = new StringClass()
    }
    return StringClass.instance
  }

  createBlankUserInstance(): StringInstance {
    return new StringInstance(this, /* value = */ '')
  }
}

export { Class, MetaClass, WrappedFunctionClass, UserFunctionClass, NoneClass, ObjectClass, StringClass, BoolClass }

