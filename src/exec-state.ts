import { Value } from './value'

export interface ValueReference {
  set(val: Value): void
  value(): Value
}

export class ExecState {
  private readonly context: { [key: string]: Value }
  constructor() {
    this.context = {}
  }

  lookup(name: string): Value {
    return this.context[name]
  }

  set(name: string, value: Value): void {
    this.context[name] = value
  }

  getRef(name: string): ValueReference {
    return {
      set: (val: Value) => this.set(name, val),
      value: () => this.lookup(name),
    }
  }
}
