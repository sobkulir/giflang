export class InputBuffer<T> {
  private pushResolve: () => void = () => { return }
  constructor(readonly arr: T[]) { }

  push(obj: T): void {
    this.arr.push(obj)
    this.pushResolve()
  }
  async popFront(): Promise<T> {
    const p = new Promise((resolve) => { this.pushResolve = resolve })
    if (this.length === 0) await p
    return this.arr.shift() as T
  }
  get length(): number {
    return this.arr.length
  }
}
