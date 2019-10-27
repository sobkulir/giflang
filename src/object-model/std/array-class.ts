import { CodeExecuter } from '../../code-executer'
import { CheckArityEq, Class, MetaClass, ObjectClass, StringClass, WrappedFunctionClass } from '../class'
import { BoolInstance, Instance, StringInstance } from '../instance'
import { MagicMethod } from '../magic-method'
import { ArrayInstance } from './array-instance'
import { Stringify } from './functions'
import { NumberClass } from './number-class'
import { NumberInstance } from './number-instance'

class ArrayClass extends Class {
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
      throw new Error('TODO: Index out of range.')
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
      throw new Error('TODO: Assignment index out of range.')
    }
  }

  static __str__(
    interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(ArrayInstance)
    const commaSeparated = Stringify(interpreter, self.values).join(', ')
    return new StringInstance(StringClass.get(), `[${commaSeparated}]`)
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
        ['length', ArrayClass._length_],
        ['push', ArrayClass._push_],
        ['pop', ArrayClass._pop_],
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

export { ArrayClass }

