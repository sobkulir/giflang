import { JisonLocator } from './ast/ast-node'

export class RuntimeError extends Error {
  readonly locator: JisonLocator

  constructor(locator: JisonLocator, msg: string) {
    super(msg)
    Object.setPrototypeOf(this, RuntimeError.prototype)
    this.locator = { ...locator }
  }

  toString(): string {
    const loc =
      `Runtime error at \
(${this.locator.first_line}:${this.locator.last_column})`
    return `${loc}: ${this.message}`
  }
}
