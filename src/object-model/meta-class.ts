import { Class } from './class'
import { Instance } from './instance'
import { ObjectClass } from './object-class'

class MetaClass extends Class {
  // Does not set base to Object.
  constructor() {
    super(null, nameof(MetaClass), null)
    this.klass = this
  }

  // TODO: Implement __call__: calls "createBlankInstance" and calls __init__.
}

export { MetaClass }
