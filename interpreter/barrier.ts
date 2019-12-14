export class Barrier {
  readonly sab: SharedArrayBuffer
  readonly int32arr: Int32Array

  constructor() {
    this.sab = new SharedArrayBuffer(4)
    this.int32arr = new Int32Array(this.sab)
  }

  reset() {
    Atomics.store(this.int32arr, 0, 0)
  }

  notify() {
    Atomics.store(this.int32arr, 0, 1)
    Atomics.notify(this.int32arr, 0, 1)
  }

  wait() {
    console.log('waitin')
    Atomics.wait(this.int32arr, 0, 0)
  }
}
