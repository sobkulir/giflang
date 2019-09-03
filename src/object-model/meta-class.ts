import { Class } from './class'
import { Instance } from './instance'
import { ObjectClass } from './object-class'

class MetaClass extends Class {
  // Does not set base to Object.
  constructor() {
    super(null, null)
    this.klass = this
  }

  // call goes through bases of klass until one with "nativeInstanceType"
  // non-null is found. Then it instantiates it and calls constructor.
  // __call__
}

export { MetaClass }
