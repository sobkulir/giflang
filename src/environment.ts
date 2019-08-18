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

  public get(name: string): Value {
    return this.getRecursive(name)
  }

  private getRecursive(name: string): Value {
    if (this.values.hasOwnProperty(name)) {
      return this.values[name]
    }

    if (this.enclosing != null) {
      return this.enclosing.getRecursive(name)
    }

    throw new Error('TODO: Unknown variable accessed')
  }

  private set(name: string, value: Value): void {
    if (!this.setRecursive(name, value)) {
      this.values[name] = value
    }
  }

  private setRecursive(name: string, value: Value): boolean {
    if (this.values.hasOwnProperty(name)) {
      this.values[name] = value
      return true
    }

    if (this.enclosing != null) {
      return this.enclosing.setRecursive(name, value)
    }

    return false
  }

  getRef(name: string): ValueRef {
    return {
      set: (value: Value) => this.set(name, value),
      value: () => this.get(name),
    }
  }
}

export { ValueRef, Environment }
