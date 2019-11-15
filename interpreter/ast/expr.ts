import { AstNode, JisonLocator } from './ast-node'
import { Operator } from './operator'

export type Expr = RefExpr | ValueExpr

export abstract class ValueExpr extends AstNode {
  abstract accept<T>(visitor: VisitorValueExpr<T>): T
}

/* Expressions that can appear on the left hand side of an assignment. */
export abstract class RefExpr extends AstNode {
  abstract accept<T>(visitor: VisitorRefExpr<T>): T
}

export interface VisitorValueExpr<T> {
  visitAssignmentValueExpr(expr: AssignmentValueExpr): T
  visitNumberValueExpr(expr: NumberValueExpr): T
  visitStringValueExpr(expr: StringValueExpr): T
  visitArrayValueExpr(expr: ArrayValueExpr): T
  visitNoneValueExpr(expr: NoneValueExpr): T
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr): T
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): T
  visitBinaryValueExpr(expr: BinaryValueExpr): T
  visitCallValueExpr(expr: CallValueExpr): T
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

export class NoneValueExpr extends ValueExpr {
  constructor(loc: JisonLocator) {
    super(loc)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitNoneValueExpr(this)
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
