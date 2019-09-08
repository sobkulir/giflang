import { MetaClass } from '../meta-class'
import { ObjectClass } from '../object-class'
import { Class } from '../class'
import { StringInstance } from './string-instance'

class StringClass extends Class {
  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(StringClass), metaClass.base as ObjectClass)
  }

  createBlankUserInstance(): StringInstance {
    return new StringInstance(this, /* value = */ '')
  }
}

export { StringClass }
