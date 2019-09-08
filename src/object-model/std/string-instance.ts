import { ObjectInstance } from '../object-instance'
import { Class } from '../class'

class StringInstance extends ObjectInstance {
  constructor(klass: Class, readonly value: string) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type NumberClass.
    super(klass)
  }
}

export { StringInstance }
