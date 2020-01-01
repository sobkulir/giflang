import { Class } from '../class'
import { Instance } from '../instance'

export class ArrayInstance extends Instance {
  constructor(klass: Class, public values: Instance[]) {
    super(klass)
  }
}
