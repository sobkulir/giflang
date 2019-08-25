import { Value } from './value'

enum CompletionType {
  NORMAL,
  RETURN,
  BREAK,
  CONTINUE,
}
class Completion {
  constructor(
    readonly type: CompletionType,
    readonly value: Value | null = null,
  ) {}
}

export { Completion, CompletionType }
