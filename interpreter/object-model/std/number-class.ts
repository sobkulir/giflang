import { CodeExecuter } from '../../code-executer'
import { CheckArityEq, Class, MetaClass, ObjectClass, StringClass, WrappedFunctionClass } from '../class'
import { BoolInstance, Instance, StringInstance } from '../instance'
import { MagicMethod } from '../magic-method'
import { NumberInstance } from './number-instance'

export class NumberClass extends Class {
  static async __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<StringInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new StringInstance(StringClass.get(), self.value.toString())
  }

  static async __pos__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<NumberInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return self
  }

  static async __neg__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<NumberInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new NumberInstance(NumberClass.get(), - self.value)
  }

  static async __bool__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): Promise<BoolInstance> {
    CheckArityEq(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return (self.value === 0) ? BoolInstance.getFalse() : BoolInstance.getTrue()
  }

  static binaryOpNumber(
    action: (lhs: number, rhs: number) => number,
  ): (_interpreter: CodeExecuter, args: Instance[]) => Promise<NumberInstance> {
    return async (_interpreter: CodeExecuter, args: Instance[]) => {
      CheckArityEq(args, 2)
      const lhs = args[0].castOrThrow(NumberInstance)
      const rhs = args[1].castOrThrow(NumberInstance)
      return new NumberInstance(NumberClass.get(), action(lhs.value, rhs.value))
    }
  }

  static binaryOpBool(
    action: (lhs: number, rhs: number) => boolean,
  ): (_interpreter: CodeExecuter, args: Instance[]) => Promise<BoolInstance> {
    return async (_interpreter: CodeExecuter, args: Instance[]) => {
      CheckArityEq(args, 2)
      const lhs = args[0].castOrThrow(NumberInstance)
      const rhs = args[1].castOrThrow(NumberInstance)
      return (action(lhs.value, rhs.value))
        ? BoolInstance.getTrue() : BoolInstance.getFalse()
    }
  }

  constructor() {
    super(MetaClass.get(), nameof(NumberClass), ObjectClass.get())
    this.addNativeMethods(
      [
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
