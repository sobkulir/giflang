import { Value } from './value'

interface ValueRef {
  set(value: Value): void
  value(): Value
}

class Environment {
  private readonly values: { [key: string]: Value }

  constructor(private readonly enclosing: Environment | null) {
    this.values = {}
  }

  get(name: string): Value {
    if (this.values.hasOwnProperty(name)) {
      return this.values[name]
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name)
    }

    throw new Error('TODO: Unknown variable accessed')
  }

  set(name: string, value: Value): void {
    this.values[name] = value
  }

  getRef(name: string): ValueRef {
    return {
      set: (value: Value) => this.set(name, value),
      value: () => this.get(name),
    }
  }
}

export { ValueRef, Environment }
