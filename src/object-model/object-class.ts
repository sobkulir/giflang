import { Class } from './class'
import { MetaClass } from './meta-class'
import { ObjectInstance } from './object-instance'

class ObjectClass extends Class {
  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(ObjectClass), /* base = */ null)
  }

  createBlankUserInstance(): ObjectInstance {
    return new ObjectInstance(this)
  }
}

export { ObjectClass }
