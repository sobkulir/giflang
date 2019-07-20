import { Operator } from './operator'

interface VisitorExpr<T> {
  visitAssignmentExpr(expr: AssignmentExpr): T
  visitNumberExpr(expr: NumberExpr): T
  visitStringExpr(expr: StringExpr): T
  visitArrayExpr(expr: ArrayExpr): T
  visitNoneExpr(expr: NoneExpr): T
  visitVariableExpr(expr: VariableExpr): T
  visitUnaryPlusMinusExpr(expr: UnaryPlusMinusExpr): T
  visitUnaryNotExpr(expr: UnaryNotExpr): T
  visitBinaryExpr(expr: BinaryExpr): T
  visitLogicalExpr(expr: LogicalExpr): T
  visitCallExpr(expr: CallExpr): T
  visitSquareAccessorExpr(expr: SquareAccessorExpr): T
  visitDotAccessorExpr(expr: DotAccessorExpr): T
}

abstract class Expr {
  abstract accept<T>(visitor: VisitorExpr<T>): T
}

class AssignmentExpr extends Expr {
  constructor(readonly lhs: Expr, readonly rhs: Expr) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitAssignmentExpr(this)
  }
}

class NumberExpr extends Expr {
  readonly value: number
  constructor(readonly rawValue: string) {
    super()
    this.value = Number(rawValue)
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitNumberExpr(this)
  }
}

class StringExpr extends Expr {
  readonly value: string
  constructor(readonly rawValue: string) {
    super()
    // TODO: Account for escaping.
    this.value = rawValue
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitStringExpr(this)
  }
}

class ArrayExpr extends Expr {
  constructor(readonly elements: Expr[]) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitArrayExpr(this)
  }
}

class NoneExpr extends Expr {
  constructor() {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitNoneExpr(this)
  }
}

class VariableExpr extends Expr {
  constructor(readonly name: string) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitVariableExpr(this)
  }
}

class UnaryPlusMinusExpr extends Expr {
  constructor(readonly operator: Operator, readonly right: Expr) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitUnaryPlusMinusExpr(this)
  }
}

class UnaryNotExpr extends Expr {
  constructor(readonly right: Expr) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitUnaryNotExpr(this)
  }
}

class BinaryExpr extends Expr {
  constructor(
    readonly operator: Operator,
    readonly left: Expr,
    readonly right: Expr,
  ) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitBinaryExpr(this)
  }
}

class LogicalExpr extends Expr {
  constructor(
    readonly operator: Operator,
    readonly left: Expr,
    readonly right: Expr,
  ) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitLogicalExpr(this)
  }
}

class CallExpr extends Expr {
  constructor(readonly callee: Expr, readonly args: Expr[]) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitCallExpr(this)
  }
}

class SquareAccessorExpr extends Expr {
  constructor(readonly object: Expr, readonly property: Expr) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitSquareAccessorExpr(this)
  }
}

class DotAccessorExpr extends Expr {
  constructor(readonly object: Expr, readonly property: Expr) {
    super()
  }

  accept<T>(visitor: VisitorExpr<T>): T {
    return visitor.visitDotAccessorExpr(this)
  }
}

export {
  VisitorExpr,
  Expr,
  AssignmentExpr,
  NumberExpr,
  StringExpr,
  ArrayExpr,
  NoneExpr,
  VariableExpr,
  UnaryPlusMinusExpr,
  UnaryNotExpr,
  BinaryExpr,
  LogicalExpr,
  CallExpr,
  SquareAccessorExpr,
  DotAccessorExpr
}
