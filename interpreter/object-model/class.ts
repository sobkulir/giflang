import { FunctionDeclExpr } from '../ast/expr'
import { Sign, signToCharMap } from '../ast/sign'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { RuntimeError } from '../runtime-error'
import { Stringify } from './functions'
import { ArrayInstance, BoolInstance, Instance, NumberInstance, ObjectInstance, StringInstance, TWrappedFunction, UserFunctionInstance, WrappedFunctionInstance } from './instance'
import { MagicMethod } from './magic-method'

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
  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    CheckArityGe(args, 1)
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
  static __init__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Instance {
    CheckArityEq(args, 1)
    return args[0]
  }

  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    CheckArityEq(args, 1)
    const className = args[0].getClass().name
    return new StringInstance(
      StringClass.get(), `"${className}-${args[0].id}"`.toUpperCase())
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): Instance {
    CheckArityEq(args, 1)
    return BoolInstance.getTrue()
  }

  static __eq__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): BoolInstance {
    CheckArityEq(args, 2)
    if (args[0].id === args[1].id) return BoolInstance.getTrue()
    else return BoolInstance.getFalse()
  }

  static __ne__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): BoolInstance {
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
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(WrappedFunctionInstance)
    return new StringInstance(
      StringClass.get(),
      `${self.isBound() ? 'Bound' : 'Unbound'} function ${self.getName()}`
        .toUpperCase()
    )
  }

  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
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
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(UserFunctionInstance)
    return new StringInstance(
      StringClass.get(),
      `${self.isBound() ? 'Bound' : 'Unbound'} function ${self.getName()}`
        .toUpperCase()
    )
  }

  static __call__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
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
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityEq(args, 1)
    return new StringInstance(
      StringClass.get(),
      signToCharMap.get(Sign.NONE) as string
    )
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): BoolInstance {
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
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(BoolInstance)
    let str = ''
    if (self === BoolInstance.getTrue()) {
      str = signToCharMap.get(Sign.TRUE) as string
    }
    else if (self === BoolInstance.getFalse()) {
      str = signToCharMap.get(Sign.FALSE) as string
    }
    return new StringInstance(StringClass.get(), str)
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): BoolInstance {
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
  static __init__(
    interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(StringInstance)
    const str = args[1].callMagicMethod(MagicMethod.__str__, [], interpreter)
    self.value = (str as StringInstance).value
    return self
  }

  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(StringInstance)
    return self
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): BoolInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(StringInstance)
    if (self.value.length === 0) return BoolInstance.getFalse()
    else return BoolInstance.getTrue()
  }

  static __add__(
    _interpreter: CodeExecuter,
    args: Instance[]
  ): StringInstance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(StringInstance)
    const rhs = args[1].castOrThrow(StringInstance)
    return new StringInstance(
      StringClass.get(),
      self.value + rhs.value
    )
  }

  static __getitem__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
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

  static __setitem__(
    _interpreter: CodeExecuter,
    _args: Instance[],
  ): StringInstance {
    throw new Error('Strings are immutable.')
  }

  static comparatorOp(
    action: (lhs: string, rhs: string) => boolean,
  ): (_interpreter: CodeExecuter, args: Instance[]) => BoolInstance {
    return (_interpreter: CodeExecuter, args: Instance[]) => {
      CheckArityEq(args, 2)
      const self = args[0].castOrThrow(StringInstance)
      const rhs = args[1].castOrThrow(StringInstance)
      if (action(self.value, rhs.value)) return BoolInstance.getTrue()
      else return BoolInstance.getFalse()
    }
  }

  static _len_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(StringInstance)
    return new NumberInstance(NumberClass.get(), self.value.length)
  }

  static _split_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): ArrayInstance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(StringInstance)
    const sep = args[1].castOrThrow(StringInstance)
    const res = self.value.split(sep.value)
      .map((v) => new StringInstance(StringClass.get(), v))
    console.log(res)
    return new ArrayInstance(ArrayClass.get(), res)
  }

  static _slice_(
    interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityGe(args, 1)
    let res: string
    const self = args[0].castOrThrow(StringInstance)
    if (args.length === 1) {
      res = self.value.slice()
    }
    else if (args.length === 2) {
      const start = args[1].castOrThrow(NumberInstance).value
      res = self.value.slice(start)
    } else if (args.length === 3) {
      const start = args[1].castOrThrow(NumberInstance).value
      const end = args[2].castOrThrow(NumberInstance).value
      res = self.value.slice(start, end)
    } else {
      throw new RuntimeError(
        interpreter.locator,
        `String.slice expects 1, 2 or 3 arguments, ${args.length} provided`)
    }

    return new StringInstance(StringClass.get(), res)
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
        [MagicMethod.__setitem__, StringClass.__setitem__],
        ['LEN', StringClass._len_],
        ['SPLIT', StringClass._split_],
        ['SLICE', StringClass._slice_],
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

export class NumberClass extends Class {
  static __init__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(NumberInstance)
    const arg = args[1]
    if (arg instanceof NumberInstance) {
      self.value = arg.value
    } else if (arg instanceof StringInstance) {
      self.value = Number(arg.value)
    }
    return self
  }

  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new StringInstance(
      StringClass.get(), self.value.toString().toUpperCase())
  }

  static __pos__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return self
  }

  static __neg__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new NumberInstance(NumberClass.get(), - self.value)
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): BoolInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return (self.value === 0) ? BoolInstance.getFalse() : BoolInstance.getTrue()
  }

  static binaryOpNumber(
    action: (lhs: number, rhs: number) => number,
  ): (_interpreter: CodeExecuter, args: Instance[]) => NumberInstance {
    return (_interpreter: CodeExecuter, args: Instance[]) => {
      CheckArityEq(args, 2)
      const lhs = args[0].castOrThrow(NumberInstance)
      const rhs = args[1].castOrThrow(NumberInstance)
      return new NumberInstance(NumberClass.get(), action(lhs.value, rhs.value))
    }
  }

  static binaryOpBool(
    action: (lhs: number, rhs: number) => boolean,
  ): (_interpreter: CodeExecuter, args: Instance[]) => BoolInstance {
    return (_interpreter: CodeExecuter, args: Instance[]) => {
      CheckArityEq(args, 2)
      const lhs = args[0].castOrThrow(NumberInstance)
      const rhs = args[1].castOrThrow(NumberInstance)
      return (action(lhs.value, rhs.value))
        ? BoolInstance.getTrue() : BoolInstance.getFalse()
    }
  }

  static _floor_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new NumberInstance(NumberClass.get(), Math.floor(self.value))
  }

  static _ceil_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new NumberInstance(NumberClass.get(), Math.ceil(self.value))
  }

  constructor() {
    super(MetaClass.get(), nameof(NumberClass), ObjectClass.get())
    this.addNativeMethods(
      [
        [MagicMethod.__init__, NumberClass.__init__],
        [MagicMethod.__str__, NumberClass.__str__],
        [MagicMethod.__neg__, NumberClass.__neg__],
        [MagicMethod.__bool__, NumberClass.__bool__],
        [MagicMethod.__add__, NumberClass.binaryOpNumber((x, y) => x + y)],
        [MagicMethod.__sub__, NumberClass.binaryOpNumber((x, y) => x - y)],
        [MagicMethod.__mul__, NumberClass.binaryOpNumber((x, y) => x * y)],
        [MagicMethod.__div__, NumberClass.binaryOpNumber((x, y) => {
          if (y === 0) throw Error('Division by zero')
          else return x / y
        })],
        [MagicMethod.__mod__, NumberClass.binaryOpNumber((x, y) => {
          if (y === 0) throw Error('Modulo by zero')
          else return x % y
        })],
        [MagicMethod.__lt__, NumberClass.binaryOpBool((x, y) => x < y)],
        [MagicMethod.__le__, NumberClass.binaryOpBool((x, y) => x <= y)],
        [MagicMethod.__eq__, NumberClass.binaryOpBool((x, y) => x === y)],
        [MagicMethod.__ne__, NumberClass.binaryOpBool((x, y) => x !== y)],
        [MagicMethod.__ge__, NumberClass.binaryOpBool((x, y) => x >= y)],
        [MagicMethod.__gt__, NumberClass.binaryOpBool((x, y) => x > y)],
        ['CEIL', NumberClass._ceil_],
        ['FLOOR', NumberClass._floor_],
      ],
      WrappedFunctionClass.get()
    )
  }
  private static instance: NumberClass
  static get(): NumberClass {
    if (!NumberClass.instance) {
      NumberClass.instance = new NumberClass()
    }
    return NumberClass.instance
  }

  canUserDeriveFrom(): boolean {
    return true
  }
  createBlankUserInstance(klass: Class): NumberInstance {
    return new NumberInstance(klass, /* value = */ 0)
  }
}

export class ArrayClass extends Class {
  static __init__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): ArrayInstance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(ArrayInstance)
    const rhs = args[1].castOrThrow(ArrayInstance)
    self.values = rhs.values.slice()
    return self
  }

  static __getitem__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(ArrayInstance)
    const key = args[1].castOrThrow(NumberInstance)
    if (key.value >= 0 && key.value < self.values.length) {
      return self.values[key.value]
    } else {
      throw new Error(`Index ${key.value} out of range.`)
    }
  }

  static __setitem__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    CheckArityEq(args, 3)
    const self = args[0].castOrThrow(ArrayInstance)
    const key = args[1].castOrThrow(NumberInstance)
    const data = args[2]
    if (key.value >= 0 && key.value < self.values.length) {
      self.values[key.value] = data
      return data
    } else {
      throw new Error(`Assignment index ${key.value} out of range.`)
    }
  }

  static __str__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(ArrayInstance)
    const stringified =
      (Stringify(interpreter, ...self.values)).join(',')
    return new StringInstance(StringClass.get(), `[${stringified}]`)
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): BoolInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(ArrayInstance)
    if (self.values.length === 0) return BoolInstance.getFalse()
    else return BoolInstance.getTrue()
  }

  static __add__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): ArrayInstance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(ArrayInstance)
    const rhs = args[1].castOrThrow(ArrayInstance)
    return new ArrayInstance(
      ArrayClass.get(),
      self.values.concat(rhs.values)
    )
  }

  static _length_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(ArrayInstance)
    return new NumberInstance(
      NumberClass.get(),
      self.values.length
    )
  }

  static _push_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    CheckArityEq(args, 2)
    const self = args[0].castOrThrow(ArrayInstance)
    const data = args[1]
    self.values.push(data)
    return self
  }

  static _pop_(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Instance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(ArrayInstance)
    self.values.pop()
    return self
  }

  constructor() {
    super(MetaClass.get(), nameof(ArrayClass), ObjectClass.get())
    this.addNativeMethods(
      [
        [MagicMethod.__init__, ArrayClass.__init__],
        [MagicMethod.__str__, ArrayClass.__str__],
        [MagicMethod.__getitem__, ArrayClass.__getitem__],
        [MagicMethod.__setitem__, ArrayClass.__setitem__],
        [MagicMethod.__bool__, ArrayClass.__bool__],
        [MagicMethod.__add__, ArrayClass.__add__],
        ['LEN', ArrayClass._length_],
        ['PUSH', ArrayClass._push_],
        ['POP', ArrayClass._pop_],
      ],
      WrappedFunctionClass.get()
    )
  }
  private static instance: ArrayClass
  static get(): ArrayClass {
    if (!ArrayClass.instance) {
      ArrayClass.instance = new ArrayClass()
    }
    return ArrayClass.instance
  }

  canUserDeriveFrom(): boolean {
    return true
  }
  createBlankUserInstance(klass: Class): ArrayInstance {
    return new ArrayInstance(klass, /* value = */[])
  }
}

export class UserClass extends Class {
  constructor(
    name: string,
    base: Class, methods: FunctionDeclExpr[], env: Environment) {
    super(MetaClass.get(), name, base)

    const superEnv = new Environment(env)
    superEnv.shallowSet('SUPER', base)

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
