import { Class } from './class'

class Instance {
  public fields: Map<string, Instance> = new Map()
  // Null for initial bootstrapping.
  constructor(public klass: Class | null) {}

  has(name: string): boolean {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    return this.fields.has(name) || this.klass.has(name)
  }

  get(name: string): Instance {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    if (this.fields.has(name)) {
      return this.fields.get(name) as Instance
    }

    if (this.klass.has(name)) {
      return this.klass.get(name)
    }

    // Maybe return null?
    throw Error('TODO')
  }

  set(name: string, value: Instance) {
    this.fields.set(name, value)
  }
}

export { Instance }
