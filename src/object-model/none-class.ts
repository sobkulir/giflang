import { Class } from './class'
import { MetaClass } from './meta-class'
import { ObjectInstance } from './object-instance'
import { Instance } from './instance'

class NoneClass extends Class {
  private instance: ObjectInstance
  constructor(metaClass: MetaClass) {
    super(metaClass, nameof(NoneClass), /* base = */ metaClass.base)
    this.instance = new ObjectInstance(this)
  }

  createBlankUserInstance(): ObjectInstance {
    return this.instance
  }
}

export { NoneClass }
