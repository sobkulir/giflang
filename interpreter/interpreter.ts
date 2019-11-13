import { JisonLocator } from './ast/ast-node'
import { BreakCompletion, Completion, CompletionType, ContinueCompletion, NormalCompletion, ReturnCompletion } from './ast/completion'
import { ArrayValueExpr, AssignmentValueExpr, BinaryValueExpr, CallValueExpr, DotAccessorRefExpr, Expr, NoneValueExpr, NumberValueExpr, RefExpr, SquareAccessorRefExpr, StringValueExpr, UnaryNotValueExpr, UnaryPlusMinusValueExpr, ValueExpr, VariableRefExpr, VisitorRefExpr, VisitorValueExpr } from './ast/expr'
import { Operator } from './ast/operator'
import { BlockStmt, ClassDefStmt, CompletionStmt, EmptyStmt, ExprStmt, ForStmt, FunctionDeclStmt, IfStmt, ProgramStmt, Stmt, VisitorStmt, WhileStmt } from './ast/stmt'
import { CodeExecuter } from './code-executer'
import { Environment } from './environment'
import { NextStepFunction } from './giflang.worker'
import { Class, ObjectClass, StringClass, UserClass, UserFunctionClass, WrappedFunctionClass } from './object-model/class'
import { BoolInstance, Instance, NoneInstance, StringInstance, UserFunctionInstance, ValueRef, WrappedFunctionInstance } from './object-model/instance'
import { MagicMethod } from './object-model/magic-method'
import { ArrayClass } from './object-model/std/array-class'
import { ArrayInstance } from './object-model/std/array-instance'
import { GiflangPrint, PrintFunction } from './object-model/std/functions'
import { NumberClass } from './object-model/std/number-class'
import { NumberInstance } from './object-model/std/number-instance'

class Interpreter
  implements
  VisitorRefExpr<Promise<ValueRef>>,
  VisitorValueExpr<Promise<Instance>>,
  VisitorStmt<Promise<Completion>>,
  CodeExecuter {
  private readonly globals: Environment
  private environment: Environment
  public callStack: string[] = []
  public locator: JisonLocator =
    { first_column: 0, first_line: 0, last_column: 0, last_line: 0 }
  public nextStep: NextStepFunction = async () => { return }

  constructor(print: PrintFunction) {
    this.globals = new Environment(null)
    this.environment = this.globals
    this.globals.getRef('PRINT').set(
      new WrappedFunctionInstance(
        WrappedFunctionClass.get(), GiflangPrint(print), 'PRINT'))
    this.globals.getRef('TRUE').set(BoolInstance.getTrue())
    this.globals.getRef('FALSE').set(BoolInstance.getFalse())
  }

  private evaluateRef(expr: RefExpr): Promise<ValueRef> {
    this.locator = expr.locator
    return expr.accept(this)
  }

  private async evaluate(expr: Expr): Promise<Instance> {
    this.locator = expr.locator
    if (expr instanceof ValueExpr) {
      return expr.accept(this)
    } else {
      return this.evaluateRef(expr).then((value) => value.get())
    }
  }

  execute(stmt: Stmt): Promise<Completion> {
    this.locator = stmt.locator
    return stmt.accept(this)
  }

  async executeInEnvironment(stmts: Stmt[], excEnv: Environment)
    : Promise<Completion> {
    const prevEnv = this.environment
    this.environment = excEnv
    let lastCompletion: Completion = new NormalCompletion()
    for (const curStmt of stmts) {
      lastCompletion = await this.execute(curStmt)
      if (!lastCompletion.isNormal()) break
    }
    this.environment = prevEnv
    return lastCompletion
  }

  async visitNumberValueExpr(expr: NumberValueExpr): Promise<Instance> {
    return new NumberInstance(NumberClass.get(), expr.value)
  }
  async visitStringValueExpr(expr: StringValueExpr): Promise<Instance> {
    return new StringInstance(StringClass.get(), expr.value)
  }
  async visitNoneValueExpr(_expr: NoneValueExpr): Promise<Instance> {
    return NoneInstance.getInstance()
  }
  async visitAssignmentValueExpr(expr: AssignmentValueExpr): Promise<Instance> {
    console.log('paused')
    await this.nextStep()
    console.log('resumed')
    const l = await this.evaluateRef(expr.lhs)
    const r = await this.evaluate(expr.rhs)
    l.set(r)
    return r
  }
  async visitArrayValueExpr(expr: ArrayValueExpr): Promise<Instance> {
    const arr: Instance[] = []
    for (const e of expr.elements) {
      arr.push(await this.evaluate(e))
    }
    return new ArrayInstance(ArrayClass.get(), arr)
  }
  async visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr)
    : Promise<Instance> {
    const r = await this.evaluate(expr.right)
    switch (expr.operator) {
      case Operator.PLUS:
        return r.callMagicMethod(MagicMethod.__pos__, [], this)
      case Operator.MINUS:
        return r.callMagicMethod(MagicMethod.__neg__, [], this)
      default:
        throw new Error('TODO: Internal.')
    }
  }
  async visitUnaryNotValueExpr(expr: UnaryNotValueExpr): Promise<Instance> {
    const r = await this.evaluate(expr.right)
    // Converts value to bool and then negates it.
    const boolRes = (await r.callMagicMethod(
      MagicMethod.__bool__, [], this)).castOrThrow(BoolInstance)
    return (boolRes.value) ? BoolInstance.getFalse() : BoolInstance.getTrue()
  }
  async visitBinaryValueExpr(expr: BinaryValueExpr): Promise<Instance> {
    const l = await this.evaluate(expr.left)
    const r = await this.evaluate(expr.right)

    switch (expr.operator) {
      case Operator.LT:
        return l.callMagicMethod(MagicMethod.__lt__, [r], this)
      case Operator.LE:
        return l.callMagicMethod(MagicMethod.__le__, [r], this)
      case Operator.GE:
        return l.callMagicMethod(MagicMethod.__ge__, [r], this)
      case Operator.GT:
        return l.callMagicMethod(MagicMethod.__gt__, [r], this)
      case Operator.EQ:
        return l.callMagicMethod(MagicMethod.__eq__, [r], this)
      case Operator.NE:
        return l.callMagicMethod(MagicMethod.__ne__, [r], this)
      case Operator.PLUS:
        return l.callMagicMethod(MagicMethod.__add__, [r], this)
      case Operator.MINUS:
        return l.callMagicMethod(MagicMethod.__sub__, [r], this)
      case Operator.MUL:
        return l.callMagicMethod(MagicMethod.__mul__, [r], this)
      case Operator.MOD:
        return l.callMagicMethod(MagicMethod.__mod__, [r], this)
      case Operator.DIV:
        return l.callMagicMethod(MagicMethod.__div__, [r], this)
      case Operator.AND:
        {
          const lRes = (await l.callMagicMethod(
            MagicMethod.__bool__, [], this)).castOrThrow(BoolInstance)
          if (!lRes.value) return lRes
          else return r.callMagicMethod(MagicMethod.__bool__, [], this)
        }
      case Operator.OR:
        {
          const lRes = (await l.callMagicMethod(
            MagicMethod.__bool__, [], this)).castOrThrow(BoolInstance)
          if (lRes.value) return lRes
          else return r.callMagicMethod(MagicMethod.__bool__, [], this)
        }
      default:
        throw Error('TODO: Internal.')
    }
  }

  async visitExprStmt(stmt: ExprStmt): Promise<Completion> {
    await this.evaluate(stmt.expr)
    return new NormalCompletion()
  }

  async visitCallValueExpr(expr: CallValueExpr): Promise<Instance> {
    const args = []
    for (const arg of expr.args) {
      args.push(await this.evaluate(arg))
    }
    return (await this.evaluate(expr.callee))
      .callMagicMethod(MagicMethod.__call__, args, this)
  }

  visitVariableRefExpr(expr: VariableRefExpr): Promise<ValueRef> {
    return Promise.resolve(this.environment.getRef(expr.name))
  }
  async visitSquareAccessorRefExpr(expr: SquareAccessorRefExpr)
    : Promise<ValueRef> {
    const arr = await this.evaluate(expr.object)
    const key = await this.evaluate(expr.property)
    return {
      set: (value: Instance) =>
        arr.callMagicMethod(MagicMethod.__setitem__, [key, value], this),
      get: () => arr.callMagicMethod(MagicMethod.__getitem__, [key], this),
    }
  }
  async visitDotAccessorRefExpr(expr: DotAccessorRefExpr): Promise<ValueRef> {
    return (await this.evaluate(expr.object)).getRef(expr.property)
  }
  async visitEmptyStmt(_: EmptyStmt): Promise<Completion> {
    return new NormalCompletion()
  }

  async visitIfStmt(stmt: IfStmt): Promise<Completion> {
    if (this.isTruthy(await this.evaluate(stmt.condition))) {
      return this.execute(stmt.consequent)
    } else if (stmt.alternate != null) {
      return this.execute(stmt.alternate)
    } else {
      return new NormalCompletion()
    }
  }
  async visitBlockStmt(stmt: BlockStmt): Promise<Completion> {
    return this.executeInEnvironment(
      stmt.stmts,
      new Environment(this.environment)
    )
  }
  async visitWhileStmt(stmt: WhileStmt): Promise<Completion> {
    let lastCompletion: Completion = new NormalCompletion()
    while (this.isTruthy(await this.evaluate(stmt.condition))) {
      lastCompletion = await this.execute(stmt.body)
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
  async visitForStmt(stmt: ForStmt): Promise<Completion> {
    const prevEnv = this.environment
    this.environment = new Environment(prevEnv)

    for (const expr of stmt.preamble) this.evaluate(expr)
    let lastCompletion: Completion = new NormalCompletion()
    while (stmt.condition === null
      || this.isTruthy(await this.evaluate(stmt.condition))) {
      lastCompletion = await this.execute(stmt.body)
      if (lastCompletion.isBreak() || lastCompletion.isReturn()) {
        break
      }
      for (const expr of stmt.increments) this.evaluate(expr)
    }

    this.environment = prevEnv
    if (lastCompletion.isReturn()) return lastCompletion
    else return new NormalCompletion()
  }

  async visitFunctionDeclStmt(stmt: FunctionDeclStmt): Promise<Completion> {
    const func = new UserFunctionInstance(
      UserFunctionClass.get(),
      stmt,
      this.environment,
      stmt.name
    )
    this.environment.getRef(stmt.name).set(func)
    return new NormalCompletion()
  }
  async visitClassDefStmt(stmt: ClassDefStmt): Promise<Completion> {
    let base: Class = ObjectClass.get()
    if (stmt.baseName) {
      const baseInstance = this.environment.get(stmt.baseName)
      if (baseInstance instanceof Class) {
        base = baseInstance as Class
      } else {
        throw new Error(`TODO: ${stmt.baseName} does not denote a class.`)
      }
    }

    this.environment.getRef(stmt.name)
      .set(new UserClass(stmt.name, base, stmt.methods, this.environment))
    return new NormalCompletion()
  }
  async visitCompletionStmt(stmt: CompletionStmt): Promise<Completion> {
    if (stmt.completionType === CompletionType.RETURN) {
      const value =
        stmt.right !== null
          ? await this.evaluate(stmt.right)
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
  async visitProgramStmt(stmt: ProgramStmt): Promise<Completion> {
    /* TODO: Hoisting? i.e. separate fncs, classes, stmts. */
    for (const s of stmt.body) {
      await this.execute(s)
    }
    return new NormalCompletion()
  }

  async isTruthy(r: Instance): Promise<boolean> {
    const boolRes = await r.callMagicMethod(MagicMethod.__bool__, [], this)
    // TODO: Enforce boolRes type
    return (boolRes as BoolInstance).value
  }
}

export { Interpreter }

