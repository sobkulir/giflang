import {
  ArrayValueExpr,
  AssignmentValueExpr,
  BinaryValueExpr,
  CallValueExpr,
  DotAccessorRefExpr,
  Expr,
  LogicalValueExpr,
  NoneValueExpr,
  NumberValueExpr,
  RefExpr,
  SquareAccessorRefExpr,
  StringValueExpr,
  UnaryNotValueExpr,
  UnaryPlusMinusValueExpr,
  ValueExpr,
  VariableRefExpr,
  VisitorRefExpr,
  VisitorValueExpr
} from './expr'
import {
  BlockStmt,
  ClassDefStmt,
  CompletionStmt,
  EmptyStmt,
  ExprStmt,
  ForStmt,
  FunctionDeclStmt,
  IfStmt,
  ProgramStmt,
  Stmt,
  VisitorStmt,
  WhileStmt
} from './stmt'
import { Operator } from './operator'
import { Environment, ValueRef } from './environment'
import {
  BoolValue,
  FunctionValue,
  NoneValue,
  NumberValue,
  StringValue,
  Value
} from './value'
import { Completion, CompletionType } from './completion'
import {
  isEqual,
  isLessThan,
  isTruthy,
  numbersOnlyOperation
} from './operations'

class Interpreter
  implements
    VisitorRefExpr<ValueRef>,
    VisitorValueExpr<Value>,
    VisitorStmt<Completion> {
  private readonly globals: Environment
  private environment: Environment
  constructor() {
    this.globals = new Environment(null)
    this.environment = this.globals
  }

  private evaluateRef(expr: RefExpr): ValueRef {
    return expr.accept(this)
  }

  private evaluate(expr: Expr): Value {
    if (expr instanceof ValueExpr) {
      return expr.accept(this)
    } else {
      return this.evaluateRef(expr).value()
    }
  }

  execute(stmt: Stmt): Completion {
    return stmt.accept(this)
  }

  executeInEnvironment(stmts: Stmt[], excEnv: Environment): Completion {
    const prevEnv = this.environment
    this.environment = excEnv
    let lastCompletion: Completion = new Completion(CompletionType.NORMAL)
    for (const curStmt of stmts) {
      lastCompletion = this.execute(curStmt)
      if (lastCompletion.type !== CompletionType.NORMAL) break
    }
    this.environment = prevEnv
    return lastCompletion
  }

  visitNumberValueExpr(expr: NumberValueExpr): Value {
    return new NumberValue(expr.value)
  }
  visitStringValueExpr(expr: StringValueExpr): Value {
    return new StringValue(expr.value)
  }
  visitNoneValueExpr(expr: NoneValueExpr): Value {
    return new NoneValue()
  }
  visitAssignmentValueExpr(expr: AssignmentValueExpr): Value {
    const l = this.evaluateRef(expr.lhs)
    const r = this.evaluate(expr.rhs)
    l.set(r)
    return r
  }
  visitArrayValueExpr(expr: ArrayValueExpr): Value {
    throw new Error('Method not implemented.')
  }
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr): Value {
    const r = this.evaluate(expr.right)

    if (r.isNumber()) {
      switch (expr.operator) {
        case Operator.PLUS:
          return new NumberValue(-r.value)
        case Operator.MINUS:
          return new NumberValue(r.value)
        default:
          // TODO: Internal error
          throw Error()
      }
    } else {
      throw Error('Unary operator <op> applied to incompatible type <val>.')
    }
  }
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): Value {
    const r = this.evaluate(expr.right)
    return new BoolValue(!isTruthy(r))
  }
  visitBinaryValueExpr(expr: BinaryValueExpr): Value {
    const l = this.evaluate(expr.left)
    const r = this.evaluate(expr.right)

    switch (expr.operator) {
      case Operator.LT:
        return new BoolValue(isLessThan(l, r))
      case Operator.LE:
        return new BoolValue(!isLessThan(r, l))
      case Operator.GE:
        return new BoolValue(!isLessThan(l, r))
      case Operator.GT:
        return new BoolValue(isLessThan(r, l))
      case Operator.EQ:
        return new BoolValue(isEqual(l, r))
      case Operator.NE:
        return new BoolValue(isEqual(l, r))
      case Operator.PLUS:
        if (l.isNumber() && r.isNumber()) {
          return new NumberValue(l.value + r.value)
        } else if (l.isString() && r.isString()) {
          return new StringValue(l.value + r.value)
        } else {
          // TODO: Arrays.
          throw new Error('Operands must be two numbers or two strings.')
        }
      case Operator.MINUS:
      case Operator.MUL:
      case Operator.MOD:
      case Operator.DIV:
        return new NumberValue(numbersOnlyOperation(l, r, expr.operator))
      default:
        // TODO
        throw Error('Internal.')
    }
  }
  visitLogicalValueExpr(expr: LogicalValueExpr): Value {
    const l = this.evaluate(expr.left)

    if (expr.operator === Operator.OR) {
      if (isTruthy(l)) return new BoolValue(true)
    } else if (expr.operator === Operator.AND) {
      if (!isTruthy(l)) return new BoolValue(true)
    } else {
      // TODO: Internal
      throw new Error('Internal.')
    }
    return new BoolValue(isTruthy(this.evaluate(expr.right)))
  }

  visitExprStmt(stmt: ExprStmt): Completion {
    this.evaluate(stmt.expr)
    return new Completion(CompletionType.NORMAL)
  }

  visitCallValueExpr(expr: CallValueExpr): Value {
    const callee = this.evaluate(expr.callee)
    if (!callee.isFunction()) {
      throw new Error('Callee must be of a function type.')
    }
    const args = []
    for (const arg of expr.args) {
      args.push(this.evaluate(arg))
    }
    const res = callee.call(this, args)
    if (res.type !== CompletionType.RETURN) {
      throw new Error(
        'Internal -- completion of fucntion call must be of RETURN type.',
      )
    }
    return res.value as Value
  }
  visitVariableRefExpr(expr: VariableRefExpr): ValueRef {
    return this.environment.getRef(expr.name)
  }
  visitSquareAccessorRefExpr(expr: SquareAccessorRefExpr): ValueRef {
    throw new Error('Method not implemented.')
  }
  visitDotAccessorRefExpr(expr: DotAccessorRefExpr): ValueRef {
    throw new Error('Method not implemented.')
  }
  visitEmptyStmt(stmt: EmptyStmt): Completion {
    return new Completion(CompletionType.NORMAL)
  }
  visitIfStmt(stmt: IfStmt): Completion {
    if (isTruthy(this.evaluate(stmt.condition))) {
      return this.execute(stmt.consequent)
    } else if (stmt.alternate != null) {
      return this.execute(stmt.alternate)
    } else {
      return new Completion(CompletionType.NORMAL)
    }
  }
  visitBlockStmt(stmt: BlockStmt): Completion {
    return this.executeInEnvironment(
      stmt.stmts,
      new Environment(this.environment),
    )
  }
  visitWhileStmt(stmt: WhileStmt): Completion {
    let lastCompletion: Completion = new Completion(CompletionType.NORMAL)
    while (isTruthy(this.evaluate(stmt.condition))) {
      lastCompletion = this.execute(stmt.body)
      if (
        lastCompletion.type === CompletionType.BREAK ||
        lastCompletion.type === CompletionType.RETURN
      ) {
        break
      }
    }

    if (lastCompletion.type === CompletionType.RETURN) return lastCompletion
    else return new Completion(CompletionType.NORMAL)
  }

  // Desugaring for-cycle to
  // {
  //   preamble
  //   while (condition) '{'
  //     { body }
  //     increments
  //   '}'
  // }
  visitForStmt(stmt: ForStmt): Completion {
    const prevEnv = this.environment
    this.environment = new Environment(prevEnv)

    for (const expr of stmt.preamble) this.evaluate(expr)
    let lastCompletion: Completion = new Completion(CompletionType.NORMAL)
    while (stmt.condition === null || isTruthy(this.evaluate(stmt.condition))) {
      lastCompletion = this.execute(stmt.body)
      if (
        lastCompletion.type === CompletionType.BREAK ||
        lastCompletion.type === CompletionType.RETURN
      ) {
        break
      }
      for (const expr of stmt.increments) this.evaluate(expr)
    }

    this.environment = prevEnv
    if (lastCompletion.type === CompletionType.RETURN) return lastCompletion
    else return new Completion(CompletionType.NORMAL)
  }

  visitFunctionDeclStmt(stmt: FunctionDeclStmt): Completion {
    const func = new FunctionValue(stmt, this.environment)
    this.environment.getRef(stmt.name).set(func)
    return new Completion(CompletionType.NORMAL)
  }
  visitClassDefStmt(stmt: ClassDefStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitCompletionStmt(stmt: CompletionStmt): Completion {
    if (stmt.completionType === CompletionType.RETURN) {
      const value =
        stmt.right !== null ? this.evaluate(stmt.right) : new NoneValue()
      return new Completion(CompletionType.RETURN, value)
    } else {
      return new Completion(stmt.completionType)
    }
  }
  visitProgramStmt(stmt: ProgramStmt): Completion {
    /* TODO: Hoisting? i.e. separate fncs, classes, stmts. */
    for (const s of stmt.body) {
      this.execute(s)
    }
    return new Completion(CompletionType.NORMAL)
  }
}

export { Interpreter }
