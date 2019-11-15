import { Instance } from '../object-model/instance'

export enum CompletionType {
  NORMAL,
  RETURN,
  BREAK,
  CONTINUE,
}

export abstract class Completion {
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

export class NormalCompletion extends Completion {
  private normalBrand: any
  constructor() {
    super()
    this.normalBrand = ''
  }
}
export class BreakCompletion extends Completion {
  private breakBrand: any
  constructor() {
    super()
    this.breakBrand = ''
  }
}
export class ContinueCompletion extends Completion {
  private continueBrand: any
  constructor() {
    super()
    this.continueBrand = ''
  }
}
export class ReturnCompletion extends Completion {
  private returnBrand: any
  constructor(readonly value: Instance) {
    super()
    this.returnBrand = ''
  }
}
