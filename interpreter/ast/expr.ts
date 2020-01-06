import { AstNode, JisonLocator } from './ast-node'
import { Operator } from './operator'
import { BlockStmt } from './stmt'

export type Expr = RefExpr | ValueExpr

// ValueExpr (value expression) is an expression that always
// results in a value that can't be assigned, e.g., a literal.
export abstract class ValueExpr extends AstNode {
  abstract accept<T>(visitor: VisitorValueExpr<T>): T
}

// RefExpr (reference expression) is an expression that can
// appear on the left hand side of an assignment.
export abstract class RefExpr extends AstNode {
  abstract accept<T>(visitor: VisitorRefExpr<T>): T
}

export interface VisitorValueExpr<T> {
  visitAssignmentValueExpr(expr: AssignmentValueExpr): T
  visitNumberValueExpr(expr: NumberValueExpr): T
  visitStringValueExpr(expr: StringValueExpr): T
  visitArrayValueExpr(expr: ArrayValueExpr): T
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr): T
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): T
  visitBinaryValueExpr(expr: BinaryValueExpr): T
  visitCallValueExpr(expr: CallValueExpr): T
  visitFunctionDeclExpr(expr: FunctionDeclExpr): T
}

export class AssignmentValueExpr extends ValueExpr {
  constructor(
    readonly lhs: RefExpr,
    readonly rhs: Expr, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitAssignmentValueExpr(this)
  }
}

export class NumberValueExpr extends ValueExpr {
  readonly value: number
  constructor(
    readonly rawValue: string, loc: JisonLocator) {
    super(loc)
    this.value = Number(rawValue)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitNumberValueExpr(this)
  }
}

export class StringValueExpr extends ValueExpr {
  readonly value: string
  constructor(
    readonly rawValue: string, loc: JisonLocator) {
    super(loc)
    this.value = rawValue
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitStringValueExpr(this)
  }
}

export class ArrayValueExpr extends ValueExpr {
  constructor(
    readonly elements: Expr[], loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitArrayValueExpr(this)
  }
}

export class UnaryPlusMinusValueExpr extends ValueExpr {
  constructor(
    readonly operator: Operator,
    readonly right: Expr, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitUnaryPlusMinusValueExpr(this)
  }
}

export class UnaryNotValueExpr extends ValueExpr {
  constructor(readonly right: Expr, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitUnaryNotValueExpr(this)
  }
}

export class BinaryValueExpr extends ValueExpr {
  constructor(
    readonly operator: Operator,
    readonly left: Expr,
    readonly right: Expr,
    loc: JisonLocator
  ) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitBinaryValueExpr(this)
  }
}

export class CallValueExpr extends ValueExpr {
  constructor(
    readonly callee: Expr,
    readonly args: Expr[], loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitCallValueExpr(this)
  }
}

export class FunctionDeclExpr extends ValueExpr {
  // If a name argument is omitted an anonymous function is created.
  readonly isAnonymous: boolean
  readonly name: string

  constructor(
    name: string | null,
    readonly parameters: string[],
    readonly body: BlockStmt,
    loc: JisonLocator,
  ) {
    super(loc)
    if (name === null) {
      this.isAnonymous = true
      this.name = `ANONYM${loc.first_line}-${loc.first_column}`
    } else {
      this.isAnonymous = false
      this.name = name
    }
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitFunctionDeclExpr(this)
  }
}

export interface VisitorRefExpr<T> {
  visitVariableRefExpr(expr: VariableRefExpr): T
  visitSquareAccessorRefExpr(expr: SquareAccessorRefExpr): T
  visitDotAccessorRefExpr(expr: DotAccessorRefExpr): T
}

export class VariableRefExpr extends RefExpr {
  constructor(readonly name: string, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorRefExpr<T>): T {
    return visitor.visitVariableRefExpr(this)
  }
}

export class SquareAccessorRefExpr extends RefExpr {
  constructor(
    readonly object: Expr,
    readonly property: Expr, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorRefExpr<T>): T {
    return visitor.visitSquareAccessorRefExpr(this)
  }
}

export class DotAccessorRefExpr extends RefExpr {
  constructor(
    readonly object: Expr,
    readonly property: string, loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorRefExpr<T>): T {
    return visitor.visitDotAccessorRefExpr(this)
  }
}
