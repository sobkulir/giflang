export class Barrier {
  readonly flagBuffer: Int32Array

  constructor(flagBuffer?: Int32Array) {
    if (flagBuffer) {
      this.flagBuffer = flagBuffer
    } else {
      const sab = new SharedArrayBuffer(4)
      this.flagBuffer = new Int32Array(sab)
    }
  }

  reset() {
    Atomics.store(this.flagBuffer, 0, 0)
  }
  notify() {
    Atomics.store(this.flagBuffer, 0, 1)
    Atomics.notify(this.flagBuffer, 0, 1)
  }
  wait() {
    Atomics.wait(this.flagBuffer, 0, 0)
  }
}

export class InputBarrier {
  readonly sizeBuffer: Int32Array
  readonly charBuffer: Uint8Array

  constructor(buffers?: { sizeBuffer: Int32Array, charBuffer: Uint8Array }) {
    if (buffers) {
      this.charBuffer = buffers.charBuffer
      this.sizeBuffer = buffers.sizeBuffer
    } else {
      let sab = new SharedArrayBuffer(1024)
      this.charBuffer = new Uint8Array(sab)
      sab = new SharedArrayBuffer(4)
      this.sizeBuffer = new Int32Array(sab)
    }
  }

  reset() {
    Atomics.store(this.sizeBuffer, 0, -1)
  }
  notify(input: string) {
    const encoder = new TextEncoder()
    const encoded = encoder.encode(input)
    this.charBuffer.set(encoded, 0)
    Atomics.store(this.sizeBuffer, 0, encoded.length)
    Atomics.notify(this.sizeBuffer, 0, 1)
  }
  wait(): string {
    Atomics.wait(this.sizeBuffer, 0, -1)
    const decoder = new TextDecoder()
    return decoder.decode(this.charBuffer.slice(0, this.sizeBuffer[0]))
  }
}
