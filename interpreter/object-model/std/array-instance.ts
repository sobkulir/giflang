import { Class } from '../class'
import { Instance, ObjectInstance } from '../instance'

class ArrayInstance extends ObjectInstance {
  constructor(klass: Class, public values: Instance[]) {
    super(klass)
  }
}

export { ArrayInstance }

