import { ObjectInstance } from '../object-instance'
import { Class } from '../class'

class NumberInstance extends ObjectInstance {
  constructor(klass: Class, readonly value: number) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type NumberClass.
    super(klass)
  }
}

export { NumberInstance }
