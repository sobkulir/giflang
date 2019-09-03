function assertUnreachable(msg: string): never {
  throw Error(`Reached *unreachable* code path: ${msg}`)
}

export { assertUnreachable }
