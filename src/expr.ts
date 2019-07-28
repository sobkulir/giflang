import { Operator } from './operator'

type Expr = RefExpr | ValueExpr

abstract class ValueExpr {
  abstract accept<T>(visitor: VisitorValueExpr<T>): T
}

interface VisitorValueExpr<T> {
  visitAssignmentValueExpr(expr: AssignmentValueExpr): T
  visitNumberValueExpr(expr: NumberValueExpr): T
  visitStringValueExpr(expr: StringValueExpr): T
  visitArrayValueExpr(expr: ArrayValueExpr): T
  visitNoneValueExpr(expr: NoneValueExpr): T
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr): T
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): T
  visitBinaryValueExpr(expr: BinaryValueExpr): T
  visitLogicalValueExpr(expr: LogicalValueExpr): T
  visitCallValueExpr(expr: CallValueExpr): T
}

class AssignmentValueExpr extends ValueExpr {
  constructor(readonly lhs: Expr, readonly rhs: Expr) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitAssignmentValueExpr(this)
  }
}

class NumberValueExpr extends ValueExpr {
  readonly value: number
  constructor(readonly rawValue: string) {
    super()
    this.value = Number(rawValue)
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitNumberValueExpr(this)
  }
}

class StringValueExpr extends ValueExpr {
  readonly value: string
  constructor(readonly rawValue: string) {
    super()
    // TODO: Account for escaping.
    this.value = rawValue
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitStringValueExpr(this)
  }
}

class ArrayValueExpr extends ValueExpr {
  constructor(readonly elements: Expr[]) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitArrayValueExpr(this)
  }
}

class NoneValueExpr extends ValueExpr {
  constructor() {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitNoneValueExpr(this)
  }
}

class UnaryPlusMinusValueExpr extends ValueExpr {
  constructor(readonly operator: Operator, readonly right: Expr) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitUnaryPlusMinusValueExpr(this)
  }
}

class UnaryNotValueExpr extends ValueExpr {
  constructor(readonly right: Expr) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitUnaryNotValueExpr(this)
  }
}

class BinaryValueExpr extends ValueExpr {
  constructor(
    readonly operator: Operator,
    readonly left: Expr,
    readonly right: Expr,
  ) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitBinaryValueExpr(this)
  }
}

class LogicalValueExpr extends ValueExpr {
  constructor(
    readonly operator: Operator,
    readonly left: Expr,
    readonly right: Expr,
  ) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitLogicalValueExpr(this)
  }
}

class CallValueExpr extends ValueExpr {
  constructor(readonly callee: Expr, readonly args: Expr[]) {
    super()
  }

  accept<T>(visitor: VisitorValueExpr<T>): T {
    return visitor.visitCallValueExpr(this)
  }
}

/* Expressions that can appear on the left hand side of an assignment. */
abstract class RefExpr {
  abstract accept<T>(visitor: VisitorRefExpr<T>): T
}

interface VisitorRefExpr<T> {
  visitVariableRefExpr(expr: VariableRefExpr): T
  visitSquareAccessorRefExpr(expr: SquareAccessorRefExpr): T
  visitDotAccessorRefExpr(expr: DotAccessorRefExpr): T
}

class VariableRefExpr extends RefExpr {
  constructor(readonly name: string) {
    super()
  }

  accept<T>(visitor: VisitorRefExpr<T>): T {
    return visitor.visitVariableRefExpr(this)
  }
}

class SquareAccessorRefExpr extends RefExpr {
  constructor(readonly object: Expr, readonly property: Expr) {
    super()
  }

  accept<T>(visitor: VisitorRefExpr<T>): T {
    return visitor.visitSquareAccessorRefExpr(this)
  }
}

class DotAccessorRefExpr extends RefExpr {
  constructor(readonly object: Expr, readonly property: Expr) {
    super()
  }

  accept<T>(visitor: VisitorRefExpr<T>): T {
    return visitor.visitDotAccessorRefExpr(this)
  }
}

export {
  VisitorValueExpr,
  VisitorRefExpr,
  Expr,
  ValueExpr,
  RefExpr,
  AssignmentValueExpr,
  NumberValueExpr,
  StringValueExpr,
  ArrayValueExpr,
  NoneValueExpr,
  VariableRefExpr,
  UnaryPlusMinusValueExpr,
  UnaryNotValueExpr,
  BinaryValueExpr,
  LogicalValueExpr,
  CallValueExpr,
  SquareAccessorRefExpr,
  DotAccessorRefExpr
}
