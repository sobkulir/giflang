import { Class } from '../class'
import { Instance, ObjectInstance } from '../instance'

export class ArrayInstance extends ObjectInstance {
  constructor(klass: Class, public values: Instance[]) {
    super(klass)
  }
}
