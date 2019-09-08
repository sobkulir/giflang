import { Instance } from './instance'
import { ObjectClass } from './object-class'
import { Class } from './class'

class ObjectInstance extends Instance {
  constructor(klass: Class) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type ObjectClass.
    super(klass)
  }
}

export { ObjectInstance }
