import { Class } from '../class'
import { Instance } from '../instance'

export class NumberInstance extends Instance {
  constructor(klass: Class, readonly value: number) {
    super(klass)
  }
}
