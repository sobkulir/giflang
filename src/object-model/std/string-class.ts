import { Interpreter } from '../../interpreter'
import { Class, MetaClass, ObjectClass } from '../class'
import { Instance } from '../instance'
import { StringInstance } from './string-instance'

class StringClass extends Class {
  static __str__(
    _interpreter: Interpreter,
    args: Instance[]
  ): StringInstance {
    // TODO: Check arity.
    const self = args[0].castOrThrow(StringInstance)
    return self
  }

  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(StringClass), metaClass.base as ObjectClass)
  }

  createBlankUserInstance(): StringInstance {
    return new StringInstance(this, /* value = */ '')
  }
}

export { StringClass }

