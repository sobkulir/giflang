import { Class } from './class'
import { Instance } from './instance'
import { MetaClass } from './meta-class'

class ObjectClass extends Class {
  // Does not set base to Object.
  constructor(metaClass: MetaClass) {
    super(metaClass, null)
  }
}

export { ObjectClass }
