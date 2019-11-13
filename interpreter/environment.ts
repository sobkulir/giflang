import { Instance, ValueRef } from './object-model/instance'

class Environment {
  private readonly values: Map<string, Instance>

  constructor(private readonly enclosing: Environment | null) {
    this.values = new Map<string, Instance>()
  }

  public get(name: string): Instance {
    return this.getRecursive(name)
  }

  public shallowSet(name: string, value: Instance) {
    this.values.set(name, value)
  }

  private getRecursive(name: string): Instance {
    if (this.values.has(name)) {
      return this.values.get(name) as Instance
    }

    if (this.enclosing != null) {
      return this.enclosing.getRecursive(name)
    }

    throw new Error('TODO: Unknown variable accessed')
  }

  private set(name: string, value: Instance): void {
    if (!this.setRecursive(name, value)) {
      this.values.set(name, value)
    }
  }

  private setRecursive(name: string, value: Instance): boolean {
    if (this.values.has(name)) {
      this.values.set(name, value)
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
      get: () => Promise.resolve(this.get(name)),
    }
  }
}

export { Environment }

