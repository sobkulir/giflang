import { Instance } from './object-model/instance'
import { Map as ImmutableMap } from 'immutable'

interface ValueRef {
  set(value: Instance): void
  get(): Instance
}

class Environment {
  private readonly values: ImmutableMap<string, Instance>

  constructor(private readonly enclosing: Environment | null) {
    this.values = ImmutableMap<string, Instance>()
  }

  public get(name: string): Instance {
    return this.getRecursive(name)
  }

  private getRecursive(name: string): Instance {
    if (this.values.hasOwnProperty(name)) {
      return this.values[name]
    }

    if (this.enclosing != null) {
      return this.enclosing.getRecursive(name)
    }

    throw new Error('TODO: Unknown variable accessed')
  }

  private set(name: string, value: Instance): void {
    if (!this.setRecursive(name, value)) {
      this.values[name] = value
    }
  }

  private setRecursive(name: string, value: Instance): boolean {
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
      set: (value: Instance) => this.set(name, value),
      get: () => this.get(name),
    }
  }
}

export { ValueRef, Environment }
