import { AssignmentExpr, Expr } from './expr'
import { CompletionType } from './completion'

interface VisitorStmt<T> {
  visitIfStmt(stmt: IfStmt): T
  visitBlockStmt(stmt: BlockStmt): T
  visitWhileStmt(stmt: WhileStmt): T
  visitForStmt(stmt: ForStmt): T
  visitFunctionDeclStmt(stmt: FunctionDeclStmt): T
  visitClassDeclStmt(stmt: ClassDeclStmt): T
  visitCompletionStmt(stmt: CompletionStmt): T
  visitProgramNode(stmt: ProgramStmt): T
}

abstract class Stmt {
  abstract accept<T>(visitor: VisitorStmt<T>): T
}

class IfStmt extends Stmt {
  constructor(
    readonly condition: Expr,
    readonly consequent: Stmt,
    readonly alternate: Stmt | null,
  ) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitIfStmt(this)
  }
}

class BlockStmt extends Stmt {
  constructor(readonly stmts: Stmt[]) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitBlockStmt(this)
  }
}

class WhileStmt extends Stmt {
  constructor(readonly condition: Expr, readonly body: Stmt) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitWhileStmt(this)
  }
}

class ForStmt extends Stmt {
  constructor(
    readonly preamble: Expr[],
    readonly condition: Expr | null,
    readonly increments: Expr[],
    readonly body: Stmt,
  ) {
    super()
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
  ) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitFunctionDeclStmt(this)
  }
}

class ClassDeclStmt extends Stmt {
  constructor(
    readonly name: string,
    readonly body: Array<FunctionConstructor | AssignmentExpr>,
  ) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitClassDeclStmt(this)
  }
}

class CompletionStmt extends Stmt {
  constructor(
    readonly completionType: CompletionType,
    readonly right: Expr | null = null,
  ) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitCompletionStmt(this)
  }
}

class ProgramStmt extends Stmt {
  constructor(readonly body: Array<Stmt | Expr>) {
    super()
  }

  accept<T>(visitor: VisitorStmt<T>): T {
    return visitor.visitProgramNode(this)
  }
}

export {
  VisitorStmt,
  Stmt,
  IfStmt,
  BlockStmt,
  WhileStmt,
  ForStmt,
  FunctionDeclStmt,
  ClassDeclStmt,
  CompletionStmt,
  ProgramStmt
}
