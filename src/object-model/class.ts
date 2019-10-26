import { FunctionDeclStmt } from '../ast/stmt'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { BoolInstance, Instance, ObjectInstance, StringInstance, TWrappedFunction, UserFunctionInstance, WrappedFunctionInstance } from './instance'
import { MagicMethod } from './magic-method'

abstract class Class extends Instance {
  // Nulls for initial bootstrapping.
  constructor(
    klass: MetaClass | null,
    readonly name: string,
    public base: Class | null,
  ) {
    super(klass)
  }

  // Returns true if users can derive from given class.
  abstract canUserDeriveFrom(): boolean
  createBlankUserInstance(klass: Class): Instance {
    throw new Error(`${this.name} class instance cannot be user-instantiated.`)
  }

  getInBases(name: string)
    : Instance | null {
    let curBase: Class | null = this
    do {
      if (curBase.fields.has(name)) {
        return curBase.fields.get(name) as Instance
      }
      curBase = curBase.base
    } while (curBase !== null)
    return null
  }


  // TODO: Test if it works with getRef
  getOrThrow(name: string): Instance {
    // Walk up the bases and don't bind.
    if (this instanceof Class) {
      const value = this.getInBases(name)
      if (value) return value
    }
    return super.getOrThrow(name)
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
  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    // TODO: Check arity.
    if (args[0] instanceof Class) {
      const originalClass = args[0] as Class
      let nativeBase = originalClass
      while (nativeBase instanceof UserClass) {
        nativeBase = nativeBase.base as Class
      }
      const instance = nativeBase.createBlankUserInstance(originalClass)
      instance.callMagicMethod(
        MagicMethod.__init__, args.slice(1), interpreter)
      return instance
    } else {
      throw new Error('TODO: Cannot be instantiated.')
    }

  }
  private constructor() {
    super(/* klass = */ null, nameof(MetaClass), /* base = */ null)
  }

  private static instance: MetaClass
  static get(): MetaClass {
    if (!MetaClass.instance) {
      MetaClass.instance = new MetaClass()
      MetaClass.instance.klass = MetaClass.instance
      MetaClass.instance.base = ObjectClass.get()
      MetaClass.instance.addNativeMethods(
        [[MagicMethod.__call__, MetaClass.__call__]],
        WrappedFunctionClass.get()
      )
    }
    return MetaClass.instance
  }

  canUserDeriveFrom(): boolean {
    return false
  }
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

  static __init__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Instance {
    // Check arity.
    return args[0]
  }

  private constructor() {
    super(/* klass = */ null, nameof(ObjectClass), /* base = */ null)
  }

  private static instance: ObjectClass
  static get(): ObjectClass {
    if (!ObjectClass.instance) {
      ObjectClass.instance = new ObjectClass()
      ObjectClass.instance.klass = MetaClass.get()
      ObjectClass.instance.addNativeMethods(
        [
          [MagicMethod.__str__, ObjectClass.__str__],
          [MagicMethod.__init__, ObjectClass.__init__]
        ],
        WrappedFunctionClass.get())
    }

    return ObjectClass.instance
  }

  canUserDeriveFrom(): boolean {
    return true
  }
  createBlankUserInstance(klass: Class): ObjectInstance {
    return new ObjectInstance(klass)
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
        [MagicMethod.__str__, BoolClass.__str__],
        [MagicMethod.__bool__, BoolClass.__bool__],
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

  canUserDeriveFrom(): boolean {
    return false
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
      [[MagicMethod.__call__, WrappedFunctionClass.__call__]],
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

  canUserDeriveFrom(): boolean {
    return false
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

  canUserDeriveFrom(): boolean {
    return false
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
      [[MagicMethod.__call__, UserFunctionClass.__call__]],
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

  canUserDeriveFrom(): boolean {
    return false
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
    this.addNativeMethods(
      [[MagicMethod.__str__, StringClass.__str__]],
      WrappedFunctionClass.get()
    )
  }
  private static instance: StringClass
  static get(): StringClass {
    if (!StringClass.instance) {
      StringClass.instance = new StringClass()
    }
    return StringClass.instance
  }

  canUserDeriveFrom(): boolean {
    return true
  }

  createBlankUserInstance(klass: Class): StringInstance {
    return new StringInstance(klass, /* value = */ '')
  }
}

class UserClass extends Class {
  constructor(
    name: string,
    base: Class, methods: FunctionDeclStmt[], env: Environment) {
    super(MetaClass.get(), name, base)

    // TODO: Super should be bound here.
    for (const m of methods) {
      this.fields.set(m.name,
        new UserFunctionInstance(UserFunctionClass.get(), m, env))
    }
  }

  canUserDeriveFrom(): boolean {
    return true
  }

  createBlankUserInstance(klass: Class): Instance {
    if (this.base === null) {
      throw new Error('TODO: Internal error, user derived class has base null.')
    }
    return this.base.createBlankUserInstance(klass)
  }
}

export { Class, MetaClass, UserClass, WrappedFunctionClass, UserFunctionClass, NoneClass, ObjectClass, StringClass, BoolClass }

