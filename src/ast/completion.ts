import { Instance } from '../object-model/instance'

enum CompletionType {
  NORMAL,
  RETURN,
  BREAK,
  CONTINUE,
}

abstract class Completion {
  isNormal(): this is NormalCompletion {
    return this instanceof NormalCompletion
  }

  isBreak(): this is BreakCompletion {
    return this instanceof BreakCompletion
  }

  isContinue(): this is ContinueCompletion {
    return this instanceof ContinueCompletion
  }

  isReturn(): this is ReturnCompletion {
    return this instanceof ReturnCompletion
  }
}

// Why "brand" members were added to all derivates of Completion?
// Empty classes would be structurally equal to each other and thus
// typeguards from Copmletion would not work as intended.
// Issue: https://github.com/microsoft/TypeScript/issues/33475

class NormalCompletion extends Completion {
  private normalBrand: any
  constructor() {
    super()
    this.normalBrand = ""
  }
}
class BreakCompletion extends Completion {
  private breakBrand: any
  constructor() {
    super()
    this.breakBrand = ""
  }
}
class ContinueCompletion extends Completion {
  private continueBrand: any
  constructor() {
    super()
    this.continueBrand = ""
  }
}
class ReturnCompletion extends Completion {
  private returnBrand: any
  constructor(readonly value: Instance) {
    super()
    this.returnBrand = ""
  }
}

export {
  Completion,
  NormalCompletion,
  BreakCompletion,
  ContinueCompletion,
  ReturnCompletion,
  CompletionType
}
