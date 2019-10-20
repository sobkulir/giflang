import { Interpreter } from '../../interpreter'
import { Class, MetaClass, ObjectClass, WrappedFunctionClass } from '../class'
import { Instance } from '../instance'
import { Natives } from '../natives'
import { NumberInstance } from './number-instance'
import { StringInstance } from './string-instance'

class NumberClass extends Class {
  static __str__(
    _interpreter: Interpreter,
    args: Instance[],
  ): StringInstance {
    // TODO: Check arity.
    const self = args[0].castOrThrow(NumberInstance)
    return Natives.getInstance().createString(self.value.toString())
  }

  static __add__(
    _interpreter: Interpreter,
    args: Instance[],
  ): NumberInstance {
    // TODO: Check arity.
    const lhs = args[0].castOrThrow(NumberInstance)
    const rhs = args[1].castOrThrow(NumberInstance)
    return Natives.getInstance().createNumber(lhs.value + rhs.value)
  }

  constructor(
    metaClass: MetaClass,
    wrappedFunctionClass: WrappedFunctionClass) {
    super(metaClass, nameof(NumberClass), metaClass.base as ObjectClass)
    this.addNativeMethod(
      '__add__',
      NumberClass.__add__,
      wrappedFunctionClass,
    )
  }

  createBlankUserInstance(): NumberInstance {
    return new NumberInstance(this, /* value = */ 0)
  }
}

export { NumberClass }

