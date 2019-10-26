import { CodeExecuter } from '../../code-executer'
import { Class, MetaClass, ObjectClass, StringClass, WrappedFunctionClass } from '../class'
import { BoolInstance, Instance, StringInstance } from '../instance'
import { MagicMethods } from '../magic-methods'
import { NumberInstance } from './number-instance'

function checkArity(args: Instance[], n: number) {
  if (args.length !== n) {
    throw Error('TODO: Wrong number of operands, expected {} got {}.')
  }
}

class NumberClass extends Class {
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    checkArity(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new StringInstance(StringClass.get(), self.value.toString())
  }

  static __neg__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    checkArity(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return new NumberInstance(NumberClass.get(), - self.value)
  }

  static __bool__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): BoolInstance {
    checkArity(args, 1)
    const self = args[0].castOrThrow(NumberInstance)
    return (self.value === 0) ? BoolInstance.getFalse() : BoolInstance.getTrue()
  }

  static binaryOpNumber(
    action: (lhs: number, rhs: number) => number,
  ): (_interpreter: CodeExecuter, args: Instance[]) => NumberInstance {
    return (_interpreter: CodeExecuter, args: Instance[]) => {
      checkArity(args, 2)
      const lhs = args[0].castOrThrow(NumberInstance)
      const rhs = args[1].castOrThrow(NumberInstance)
      return new NumberInstance(NumberClass.get(), action(lhs.value, rhs.value))
    }
  }

  static binaryOpBool(
    action: (lhs: number, rhs: number) => boolean,
  ): (_interpreter: CodeExecuter, args: Instance[]) => BoolInstance {
    return (_interpreter: CodeExecuter, args: Instance[]) => {
      checkArity(args, 2)
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
        [MagicMethods.__str__, NumberClass.__str__],
        [MagicMethods.__neg__, NumberClass.__neg__],
        [MagicMethods.__bool__, NumberClass.__bool__],
        [MagicMethods.__add__, NumberClass.binaryOpNumber((x, y) => x + y)],
        [MagicMethods.__sub__, NumberClass.binaryOpNumber((x, y) => x - y)],
        [MagicMethods.__mul__, NumberClass.binaryOpNumber((x, y) => x * y)],
        [MagicMethods.__div__, NumberClass.binaryOpNumber((x, y) => {
          if (y === 0) throw Error('TODO: Division by zero')
          else return x / y
        })],
        [MagicMethods.__div__, NumberClass.binaryOpNumber((x, y) => {
          if (y === 0) throw Error('TODO: Modulo by zero')
          else return x % y
        })],
        [MagicMethods.__lt__, NumberClass.binaryOpBool((x, y) => x < y)],
        [MagicMethods.__le__, NumberClass.binaryOpBool((x, y) => x <= y)],
        [MagicMethods.__eq__, NumberClass.binaryOpBool((x, y) => x === y)],
        [MagicMethods.__ne__, NumberClass.binaryOpBool((x, y) => x !== y)],
        [MagicMethods.__ge__, NumberClass.binaryOpBool((x, y) => x >= y)],
        [MagicMethods.__gt__, NumberClass.binaryOpBool((x, y) => x > y)],
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

export { NumberClass }

