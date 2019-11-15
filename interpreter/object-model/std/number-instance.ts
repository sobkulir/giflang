import { Class } from '../class'
import { ObjectInstance } from '../instance'

export class NumberInstance extends ObjectInstance {
  constructor(klass: Class, readonly value: number) {
    super(klass)
  }
}
