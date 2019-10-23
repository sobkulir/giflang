import { BreakCompletion, Completion, CompletionType, ContinueCompletion, NormalCompletion, ReturnCompletion } from './ast/completion'
import { ArrayValueExpr, AssignmentValueExpr, BinaryValueExpr, CallValueExpr, DotAccessorRefExpr, Expr, NoneValueExpr, NumberValueExpr, RefExpr, SquareAccessorRefExpr, StringValueExpr, UnaryNotValueExpr, UnaryPlusMinusValueExpr, ValueExpr, VariableRefExpr, VisitorRefExpr, VisitorValueExpr } from './ast/expr'
import { Operator } from './ast/operator'
import { BlockStmt, ClassDefStmt, CompletionStmt, EmptyStmt, ExprStmt, ForStmt, FunctionDeclStmt, IfStmt, ProgramStmt, Stmt, VisitorStmt, WhileStmt } from './ast/stmt'
import { CodeExecuter } from './code-executer'
import { Environment, ValueRef } from './environment'
import { StringClass, UserFunctionClass, WrappedFunctionClass } from './object-model/class'
import { BoolInstance, FunctionInstance, Instance, NoneInstance, StringInstance, UserFunctionInstance, WrappedFunctionInstance } from './object-model/instance'
import { MagicMethods } from './object-model/magic-methods'
import { GiflangPrint } from './object-model/std/functions'
import { NumberClass } from './object-model/std/number-class'
import { NumberInstance } from './object-model/std/number-instance'

class Interpreter
  implements
  VisitorRefExpr<ValueRef>,
  VisitorValueExpr<Instance>,
  VisitorStmt<Completion>,
  CodeExecuter {
  private readonly globals: Environment
  private environment: Environment

  constructor(print: (str: string) => void) {
    this.globals = new Environment(null)
    this.environment = this.globals
    this.globals.getRef('PRINT').set(
      new WrappedFunctionInstance(
        WrappedFunctionClass.get(), GiflangPrint(print)))
  }

  private evaluateRef(expr: RefExpr): ValueRef {
    return expr.accept(this)
  }

  private evaluate(expr: Expr): Instance {
    if (expr instanceof ValueExpr) {
      return expr.accept(this)
    } else {
      return this.evaluateRef(expr).get()
    }
  }

  execute(stmt: Stmt): Completion {
    return stmt.accept(this)
  }

  executeInEnvironment(stmts: Stmt[], excEnv: Environment): Completion {
    const prevEnv = this.environment
    this.environment = excEnv
    let lastCompletion: Completion = new NormalCompletion()
    for (const curStmt of stmts) {
      lastCompletion = this.execute(curStmt)
      if (lastCompletion.isReturn()) break
      else if (lastCompletion.isContinue() || lastCompletion.isBreak()) {
        throw new Error('TODO: Unexpected break or continue.')
      }
    }
    this.environment = prevEnv
    return lastCompletion
  }

  visitNumberValueExpr(expr: NumberValueExpr): Instance {
    return new NumberInstance(NumberClass.get(), expr.value)
  }
  visitStringValueExpr(expr: StringValueExpr): Instance {
    return new StringInstance(StringClass.get(), expr.value)
  }
  visitNoneValueExpr(_expr: NoneValueExpr): Instance {
    return NoneInstance.getInstance()
  }
  visitAssignmentValueExpr(expr: AssignmentValueExpr): Instance {
    const l = this.evaluateRef(expr.lhs)
    const r = this.evaluate(expr.rhs)
    l.set(r)
    return r
  }
  visitArrayValueExpr(expr: ArrayValueExpr): Instance {
    throw new Error('Method not implemented.')
  }
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr): Instance {
    const r = this.evaluate(expr.right)
    switch (expr.operator) {
      case Operator.PLUS:
        return r.callMagicMethod(MagicMethods.__pos__, [r], this)
      case Operator.LE:
        return r.callMagicMethod(MagicMethods.__neg__, [r], this)
      default:
        throw new Error('TODO: Internal.')
    }
  }
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): Instance {
    const r = this.evaluate(expr.right)
    // Converts value to bool and then negates it.
    const boolRes = r.callMagicMethod(MagicMethods.__bool__, [r], this)
    return (boolRes) ? BoolInstance.getFalse() : BoolInstance.getTrue()
  }
  visitBinaryValueExpr(expr: BinaryValueExpr): Instance {
    const l = this.evaluate(expr.left)
    const r = this.evaluate(expr.right)

    switch (expr.operator) {
      case Operator.LT:
        return l.callMagicMethod(MagicMethods.__lt__, [l, r], this)
      case Operator.LE:
        return l.callMagicMethod(MagicMethods.__le__, [l, r], this)
      case Operator.GE:
        return l.callMagicMethod(MagicMethods.__ge__, [l, r], this)
      case Operator.GT:
        return l.callMagicMethod(MagicMethods.__gt__, [l, r], this)
      case Operator.EQ:
        return l.callMagicMethod(MagicMethods.__eq__, [l, r], this)
      case Operator.NE:
        return l.callMagicMethod(MagicMethods.__ne__, [l, r], this)
      case Operator.PLUS:
        return l.callMagicMethod(MagicMethods.__add__, [l, r], this)
      case Operator.MINUS:
        return l.callMagicMethod(MagicMethods.__sub__, [l, r], this)
      case Operator.MUL:
        return l.callMagicMethod(MagicMethods.__mul__, [l, r], this)
      case Operator.MOD:
        return l.callMagicMethod(MagicMethods.__mod__, [l, r], this)
      case Operator.DIV:
        return l.callMagicMethod(MagicMethods.__div__, [l, r], this)
      case Operator.AND:
        return l.callMagicMethod(MagicMethods.__and__, [l, r], this)
      case Operator.OR:
        return l.callMagicMethod(MagicMethods.__or__, [l, r], this)
      default:
        throw Error('TODO: Internal.')
    }
  }

  visitExprStmt(stmt: ExprStmt): Completion {
    this.evaluate(stmt.expr)
    return new NormalCompletion()
  }

  visitCallValueExpr(expr: CallValueExpr): Instance {
    const callee = this.evaluate(expr.callee)
    // TODO: Use __call__
    // callee = this.evaluate(expr.callee).get(__call__)
    if (!(callee instanceof FunctionInstance)) {
      throw new Error('Callee must be of a function type.')
    }
    const args = []
    for (const arg of expr.args) {
      args.push(this.evaluate(arg))
    }
    return (callee as FunctionInstance).call(this, args)
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
    return new NormalCompletion()
  }
  visitIfStmt(stmt: IfStmt): Completion {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      return this.execute(stmt.consequent)
    } else if (stmt.alternate != null) {
      return this.execute(stmt.alternate)
    } else {
      return new NormalCompletion()
    }
  }
  visitBlockStmt(stmt: BlockStmt): Completion {
    return this.executeInEnvironment(
      stmt.stmts,
      new Environment(this.environment)
    )
  }
  visitWhileStmt(stmt: WhileStmt): Completion {
    let lastCompletion: Completion = new NormalCompletion()
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      lastCompletion = this.execute(stmt.body)
      if (lastCompletion.isBreak() || lastCompletion.isReturn()) {
        break
      }
    }

    if (lastCompletion.isReturn()) return lastCompletion
    else return new NormalCompletion()
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
    let lastCompletion: Completion = new NormalCompletion()
    while (stmt.condition === null
      || this.isTruthy(this.evaluate(stmt.condition))) {
      lastCompletion = this.execute(stmt.body)
      if (lastCompletion.isBreak() || lastCompletion.isReturn()) {
        break
      }
      for (const expr of stmt.increments) this.evaluate(expr)
    }

    this.environment = prevEnv
    if (lastCompletion.isReturn()) return lastCompletion
    else return new NormalCompletion()
  }

  visitFunctionDeclStmt(stmt: FunctionDeclStmt): Completion {
    const func = new UserFunctionInstance(
      UserFunctionClass.get(),
      stmt,
      this.environment
    )
    this.environment.getRef(stmt.name).set(func)
    return new NormalCompletion()
  }
  visitClassDefStmt(stmt: ClassDefStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitCompletionStmt(stmt: CompletionStmt): Completion {
    if (stmt.completionType === CompletionType.RETURN) {
      const value =
        stmt.right !== null
          ? this.evaluate(stmt.right)
          : NoneInstance.getInstance()
      return new ReturnCompletion(value)
    } else if (stmt.completionType === CompletionType.BREAK) {
      return new BreakCompletion()
    } else if (stmt.completionType === CompletionType.CONTINUE) {
      return new ContinueCompletion()
    } else {
      return new NormalCompletion()
    }
  }
  visitProgramStmt(stmt: ProgramStmt): Completion {
    /* TODO: Hoisting? i.e. separate fncs, classes, stmts. */
    for (const s of stmt.body) {
      this.execute(s)
    }
    return new NormalCompletion()
  }

  isTruthy(r: Instance): boolean {
    const boolRes = r.callMagicMethod(MagicMethods.__bool__, [r], this)
    return (boolRes as BoolInstance).value
  }
}


export { Interpreter }

