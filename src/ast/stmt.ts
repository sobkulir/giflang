import { AstNode, JisonLocator } from './ast-node'
import { CompletionType } from './completion'
import { Expr } from './expr'

interface VisitorStmt<T> {
  visitIfStmt(stmt: IfStmt): T
  visitBlockStmt(stmt: BlockStmt): T
  visitWhileStmt(stmt: WhileStmt): T
  visitForStmt(stmt: ForStmt): T
  visitFunctionDeclStmt(stmt: FunctionDeclStmt): T
  visitClassDefStmt(stmt: ClassDefStmt): T
  visitCompletionStmt(stmt: CompletionStmt): T
  visitProgramStmt(stmt: ProgramStmt): T
  visitEmptyStmt(stmt: EmptyStmt): T
  visitExprStmt(stmt: ExprStmt): T
}

abstract class Stmt extends AstNode {
  abstract accept<T>(visitor: VisitorStmt<T>): T
}

class IfStmt extends Stmt {
  readonly consequent: BlockStmt
  readonly alternate: BlockStmt | null

  constructor(
    readonly condition: Expr,
    consequent: Stmt,
    alternate: Stmt | null,
    loc: JisonLocator
  ) {
    super(loc)
    this.consequent = ensureIsBlockStmt(consequent)
    this.alternate = alternate !== null ? ensureIsBlockStmt(alternate) : null
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitIfStmt(this)
  }
}

class BlockStmt extends Stmt {
  constructor(readonly stmts: Stmt[], loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitBlockStmt(this)
  }
}

class WhileStmt extends Stmt {
  readonly body: BlockStmt

  constructor(
    readonly condition: Expr,
    body: Stmt, loc: JisonLocator) {
    super(loc)
    this.body = ensureIsBlockStmt(body)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitWhileStmt(this)
  }
}

class ForStmt extends Stmt {
  readonly body: BlockStmt

  constructor(
    readonly preamble: Expr[],
    readonly condition: Expr | null,
    readonly increments: Expr[],
    body: Stmt,
    loc: JisonLocator
  ) {
    super(loc)
    this.body = ensureIsBlockStmt(body)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitForStmt(this)
  }
}

class FunctionDeclStmt extends Stmt {
  constructor(
    readonly name: string,
    readonly parameters: string[],
    readonly body: BlockStmt,
    loc: JisonLocator
  ) {
    super(loc)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitFunctionDeclStmt(this)
  }
}

class ClassDefStmt extends Stmt {
  constructor(
    readonly name: string,
    readonly baseName: string | null,
    readonly methods: FunctionDeclStmt[],
    loc: JisonLocator
  ) {
    super(loc)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitClassDefStmt(this)
  }
}

class CompletionStmt extends Stmt {
  constructor(
    readonly completionType: CompletionType,
    readonly right: Expr | null = null,
    loc: JisonLocator
  ) {
    super(loc)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitCompletionStmt(this)
  }
}

class ProgramStmt extends Stmt {
  constructor(readonly body: Stmt[], loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitProgramStmt(this)
  }
}

class EmptyStmt extends Stmt {
  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitEmptyStmt(this)
  }
}

class ExprStmt extends Stmt {
  constructor(readonly expr: Expr, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitExprStmt(this)
  }
}

// Function encapsulates a single statement into a block
// if it's not a BlockStmt already.
function ensureIsBlockStmt(stmt: Stmt): BlockStmt {
  if (stmt instanceof BlockStmt) return stmt
  else return new BlockStmt([stmt], stmt.locator)
}

export { VisitorStmt, Stmt, IfStmt, BlockStmt, WhileStmt, ForStmt, FunctionDeclStmt, ClassDefStmt, CompletionStmt, ProgramStmt, EmptyStmt, ExprStmt }

