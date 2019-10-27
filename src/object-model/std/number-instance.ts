import { Class } from '../class'
import { ObjectInstance } from '../instance'

class NumberInstance extends ObjectInstance {
  constructor(klass: Class, readonly value: number) {
    super(klass)
  }
}

export { NumberInstance }

