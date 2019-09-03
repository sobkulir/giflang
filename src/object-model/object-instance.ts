import { Instance } from './instance'
import { ObjectClass } from './object-class'

class ObjectInstance extends Instance {
  constructor(objectClass: ObjectClass) {
    super(objectClass)
  }
}

export { ObjectInstance }
