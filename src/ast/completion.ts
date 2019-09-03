import { Instance } from './object-model/instance'

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

class NormalCompletion extends Completion {}
class BreakCompletion extends Completion {}
class ContinueCompletion extends Completion {}
class ReturnCompletion extends Completion {
  constructor(readonly value: Instance) {
    super()
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
