export type JisonLocator = {
  first_line: number,
  first_column: number,
  last_line: number,
  last_column: number
}

export abstract class AstNode {
  constructor(readonly locator: JisonLocator) { }
}
