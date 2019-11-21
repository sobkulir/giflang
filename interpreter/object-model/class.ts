import { FunctionDeclStmt } from '../ast/stmt'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { BoolInstance, Instance, ObjectInstance, StringInstance, TWrappedFunction, UserFunctionInstance, WrappedFunctionInstance } from './instance'
import { MagicMethod } from './magic-method'
import { Stringify } from './std/functions'
import { NumberInstance } from './std/number-instance'

export function CheckArityEq(args: Instance[], n: number) {
  // TODO: Add fcn name.
  if (args.length !== n) {
    throw Error(
      `Wrong number of operands, expected ${n} got ${args.length}.`)
  }
}

export function CheckArityGe(args: Instance[], n: number) {
  // TODO: Add fcn name.
  if (args.length < n) {
    throw Error(
      // tslint:disable-next-line:max-line-length
      `Wrong number of operands, expected at least ${n} got ${args.length}.`)
  }
}

export abstract class Class extends Instance {
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
    throw new Error(`${klass.name} class instance cannot be user-instantiated.`)
  }

  getInBases(name: string): Instance | null {
    let curBase: Class | null = this
    do {
      if (curBase.fields.has(name)) {
        return curBase.fields.get(name) as Instance
      }
      curBase = curBase.base
    } while (curBase !== null)
    return null
  }

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
          `${this.name}.${m[0]}`
        ),
      )
    }
  }
}

export class MetaClass extends Class {
  // MetaClass's __call__ is responsible for creation of new objects.
  static async __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<Instance> {
    CheckArityGe(args, 1)
    if (args[0] instanceof Class) {
      const originalClass = args[0] as Class
      let nativeBase = originalClass
      while (nativeBase instanceof UserClass) {
        nativeBase = nativeBase.base as Class
      }
      const instance = nativeBase.createBlankUserInstance(originalClass)
      await instance.callMagicMethod(
        MagicMethod.__init__, args.slice(1), interpreter)
      return instance
    } else {
      throw new Error(
        `${Stringify(interpreter, args[0])} cannot be instantiated.`)
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

export class ObjectClass extends Class {
  static async __init__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<Instance> {
    CheckArityEq(args, 1)
    return args[0]
  }

  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    const className = args[0].getClass().name
    return new StringInstance(
      StringClass.get(), `Instance of class "${className}"`)
  }

  static async __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<Instance> {
    CheckArityEq(args, 1)
    return BoolInstance.getTrue()
  }

  static async __eq__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<BoolInstance> {
    CheckArityEq(args, 2)
    if (args[0].id === args[1].id) return BoolInstance.getTrue()
    else return BoolInstance.getFalse()
  }

  static async __ne__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<BoolInstance> {
    CheckArityEq(args, 2)
    if (args[0].id !== args[1].id) return BoolInstance.getTrue()
    else return BoolInstance.getFalse()
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
          [MagicMethod.__init__, ObjectClass.__init__],
          [MagicMethod.__str__, ObjectClass.__str__],
          [MagicMethod.__bool__, ObjectClass.__bool__],
          [MagicMethod.__eq__, ObjectClass.__eq__],
          [MagicMethod.__ne__, ObjectClass.__ne__],

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

export class WrappedFunctionClass extends Class {
  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(WrappedFunctionInstance)
    return new StringInstance(
      StringClass.get(),
      `${self.isBound() ? 'Bound' : 'Unbound'} function ${self.getName()}`
    )
  }

  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<Instance> {
    CheckArityGe(args, 1)
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
      [
        [MagicMethod.__call__, WrappedFunctionClass.__call__],
        [MagicMethod.__str__, WrappedFunctionClass.__str__],
      ],
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

export class UserFunctionClass extends Class {
  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(UserFunctionInstance)
    return new StringInstance(
      StringClass.get(),
      `${self.isBound() ? 'Bound' : 'Unbound'} function ${self.getName()}`
    )
  }

  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<Instance> {
    CheckArityGe(args, 1)
    const self = args[0].castOrThrow(UserFunctionInstance)
    return self.call(interpreter, args.slice(1))
  }

  private constructor() {
    super(MetaClass.get(), nameof(UserFunctionClass), ObjectClass.get())

    this.addNativeMethods(
      [
        [MagicMethod.__call__, UserFunctionClass.__call__],
        [MagicMethod.__str__, UserFunctionClass.__str__]
      ],
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

export class NoneClass extends Class {
  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    return new StringInstance(
      StringClass.get(),
      'NONE'
    )
  }

  static async __bool__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<BoolInstance> {
    CheckArityEq(args, 1)
    return BoolInstance.getFalse()
  }

  private constructor() {
    super(MetaClass.get(), nameof(NoneClass), ObjectClass.get())
    this.addNativeMethods(
      [
        [MagicMethod.__str__, NoneClass.__str__],
        [MagicMethod.__bool__, NoneClass.__bool__],
      ],
      WrappedFunctionClass.get()
    )
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

export class BoolClass extends Class {
  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(BoolInstance)
    let str = ''
    if (self === BoolInstance.getTrue()) {
      str = 'TRUE'
    }
    else if (self === BoolInstance.getFalse()) {
      str = 'FALSE'
    }
    return new StringInstance(StringClass.get(), str)
  }

  static async __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<BoolInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(BoolInstance)
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

export class StringClass extends Class {
  static async __init__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<StringInstance> {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(StringInstance)
    const rhs = args[1].castOrThrow(StringInstance)
    self.value = rhs.value.slice(0)
    return self
  }

  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(StringInstance)
    return self
  }

  static async __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<BoolInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(StringInstance)
    if (self.value.length === 0) return BoolInstance.getFalse()
    else return BoolInstance.getTrue()
  }

  static async __add__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Promise<StringInstance> {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(StringInstance)
    const rhs = args[1].castOrThrow(StringInstance)
    return new StringInstance(
      StringClass.get(),
      self.value + rhs.value
    )
  }

  static async __getitem__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<StringInstance> {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(StringInstance)
    const key = args[1].castOrThrow(NumberInstance)
    if (key.value >= 0 && key.value < self.value.length) {
      return new StringInstance(
        StringClass.get(),
        self.value[key.value]
      )
    } else {
      throw new Error(`Index ${key.value} out of range.`)
    }
  }

  static async __setitem__(
    _interpreter: CodeExecuter,
    _args: Instance[],
  ): Promise<StringInstance> {
    throw new Error('Strings are immutable.')
  }

  static comparatorOp(
    action: (lhs: string, rhs: string) => boolean,
  ): (_interpreter: CodeExecuter, args: Instance[]) => Promise<BoolInstance> {
    return async (_interpreter: CodeExecuter, args: Instance[]) => {
      CheckArityEq(args, 2)
      const self = args[0].castOrThrow(StringInstance)
      const rhs = args[1].castOrThrow(StringInstance)
      if (action(self.value, rhs.value)) return BoolInstance.getTrue()
      else return BoolInstance.getFalse()
    }
  }

  private constructor() {
    super(MetaClass.get(), nameof(StringClass), ObjectClass.get())
    this.addNativeMethods(
      [
        [MagicMethod.__init__, StringClass.__init__],
        [MagicMethod.__str__, StringClass.__str__],
        [MagicMethod.__bool__, StringClass.__bool__],
        [MagicMethod.__add__, StringClass.__add__],
        [MagicMethod.__bool__, StringClass.__bool__],
        [MagicMethod.__lt__, StringClass.comparatorOp((l, r) => l < r)],
        [MagicMethod.__le__, StringClass.comparatorOp((l, r) => l <= r)],
        [MagicMethod.__eq__, StringClass.comparatorOp((l, r) => l === r)],
        [MagicMethod.__ne__, StringClass.comparatorOp((l, r) => l !== r)],
        [MagicMethod.__ge__, StringClass.comparatorOp((l, r) => l >= r)],
        [MagicMethod.__gt__, StringClass.comparatorOp((l, r) => l > r)],
        [MagicMethod.__getitem__, StringClass.__getitem__],
        [MagicMethod.__setitem__, StringClass.__setitem__]
      ],
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

export class UserClass extends Class {
  constructor(
    name: string,
    base: Class, methods: FunctionDeclStmt[], env: Environment) {
    super(MetaClass.get(), name, base)

    const superEnv = new Environment(env)
    superEnv.shallowSet('super', base)

    for (const m of methods) {
      this.fields.set(m.name,
        new UserFunctionInstance(
          UserFunctionClass.get(),
          m,
          superEnv,
          `${this.name}.${m.name}`))
    }
  }

  canUserDeriveFrom(): boolean {
    return true
  }
  createBlankUserInstance(klass: Class): Instance {
    if (this.base === null) {
      throw new Error('Internal error, user derived class has base null.')
    }
    return this.base.createBlankUserInstance(klass)
  }
}
