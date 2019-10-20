import { Class } from '../class'
import { ObjectInstance } from '../instance'

class StringInstance extends ObjectInstance {
  constructor(klass: Class, readonly value: string) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type NumberClass.
    super(klass)
  }
}

export { StringInstance }

