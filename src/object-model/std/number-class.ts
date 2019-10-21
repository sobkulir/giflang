import { CodeExecuter } from '../../code-executer'
import { Class, MetaClass, ObjectClass, StringClass, WrappedFunctionClass } from '../class'
import { Instance, StringInstance } from '../instance'
import { MagicMethods } from '../magic-methods'
import { NumberInstance } from './number-instance'

class NumberClass extends Class {
  static __str__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): StringInstance {
    // TODO: Check arity.
    const self = args[0].castOrThrow(NumberInstance)
    return new StringInstance(StringClass.get(), self.value.toString())
  }

  static __add__(
    _interpreter: CodeExecuter,
    args: Instance[],
  ): NumberInstance {
    // TODO: Check arity.
    const lhs = args[0].castOrThrow(NumberInstance)
    const rhs = args[1].castOrThrow(NumberInstance)
    return new NumberInstance(NumberClass.get(), lhs.value + rhs.value)
  }

  constructor() {
    super(MetaClass.get(), nameof(NumberClass), ObjectClass.get())
    this.addNativeMethods(
      [
        [MagicMethods.__add__, NumberClass.__add__],
        [MagicMethods.__str__, NumberClass.__str__]
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

  createBlankUserInstance(): NumberInstance {
    return new NumberInstance(this, /* value = */ 0)
  }
}

export { NumberClass }

