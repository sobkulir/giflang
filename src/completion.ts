enum CompletionType {
  NORMAL,
  RETURN,
  BREAK,
  CONTINUE,
}
class Completion {
  constructor(readonly type: CompletionType) {}
}

export { Completion, CompletionType }
