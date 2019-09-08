import { MetaClass } from '../meta-class'
import { ObjectClass } from '../object-class'
import { Class } from '../class'
import { NumberInstance } from './number-instance'

class NumberClass extends Class {
  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(NumberClass), metaClass.base as ObjectClass)
  }

  createBlankUserInstance(): NumberInstance {
    return new NumberInstance(this, /* value = */ 0)
  }
}

export { NumberClass }
