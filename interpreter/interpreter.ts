import { JisonLocator } from './ast/ast-node'
import { BreakCompletion, Completion, CompletionType, ContinueCompletion, NormalCompletion, ReturnCompletion } from './ast/completion'
import { ArrayValueExpr, AssignmentValueExpr, BinaryValueExpr, CallValueExpr, DotAccessorRefExpr, Expr, NoneValueExpr, NumberValueExpr, RefExpr, SquareAccessorRefExpr, StringValueExpr, UnaryNotValueExpr, UnaryPlusMinusValueExpr, ValueExpr, VariableRefExpr, VisitorRefExpr, VisitorValueExpr } from './ast/expr'
import { Operator } from './ast/operator'
import { InputSign, PrintSign, signToCharMap } from './ast/sign'
import { BlockStmt, ClassDefStmt, CompletionStmt, EmptyStmt, ExprStmt, ForStmt, FunctionDeclStmt, IfStmt, ProgramStmt, Stmt, VisitorStmt, WhileStmt } from './ast/stmt'
import { Barrier } from './barrier'
import { CodeExecuter } from './code-executer'
import { Environment, SerializedEnvironment } from './environment'
import { Class, ObjectClass, StringClass, UserClass, UserFunctionClass, WrappedFunctionClass } from './object-model/class'
import { BoolInstance, Instance, NoneInstance, StringInstance, UserFunctionInstance, ValueRef, WrappedFunctionInstance } from './object-model/instance'
import { MagicMethod } from './object-model/magic-method'
import { ArrayClass } from './object-model/std/array-class'
import { ArrayInstance } from './object-model/std/array-instance'
import { GiflangInput, GiflangPrint, InputFunction, PrintFunction } from './object-model/std/functions'
import { NumberClass } from './object-model/std/number-class'
import { NumberInstance } from './object-model/std/number-instance'
import { RuntimeError } from './runtime-error'

export type CallStack = string[]

export type NextStepFunction =
  (arr: Int32Array,
    locator: JisonLocator,
    callStack: CallStack, environment: SerializedEnvironment) => void

export interface InterpreterSetup {
  onNextStep: NextStepFunction,
  onPrint: PrintFunction,
  onInput: InputFunction
}

export class Interpreter
  implements
  VisitorRefExpr<ValueRef>,
  VisitorValueExpr<Instance>,
  VisitorStmt<Completion>,
  CodeExecuter {
  private readonly stepperBarrier: Barrier
  private readonly globals: Environment
  private environment: Environment
  public callStack: string[] = ['main']
  public locator: JisonLocator =
    { first_column: 0, first_line: 0, last_column: 0, last_line: 0 }
  public waitForNextStep = (_locator: JisonLocator) => { return }

  constructor(readonly setup: InterpreterSetup, isDebugMode: boolean = false) {
    this.globals = new Environment(null)
    this.environment = new Environment(this.globals)
    this.globals.getRef(signToCharMap.get(PrintSign) as string).set(
      new WrappedFunctionInstance(
        WrappedFunctionClass.get(),
        GiflangPrint(setup.onPrint), 'PRINT'))
    this.globals.getRef(signToCharMap.get(InputSign) as string).set(
      new WrappedFunctionInstance(
        WrappedFunctionClass.get(),
        GiflangInput(setup.onInput), 'INPUT'))
    this.globals.getRef('TRUE').set(BoolInstance.getTrue())
    this.globals.getRef('FALSE').set(BoolInstance.getFalse())
    this.stepperBarrier = new Barrier()

    if (isDebugMode) {
      this.waitForNextStep = (locator: JisonLocator) => {
        this.stepperBarrier.reset()
        setup.onNextStep(
          this.stepperBarrier.int32arr,
          locator, this.callStack, this.environment.flatten(this))
        this.stepperBarrier.wait()
      }
    }
  }

  public resolveNextStep() {
    this.stepperBarrier.notify()
  }

  private evaluateRef(expr: RefExpr): ValueRef {
    this.locator = expr.locator
    return expr.accept(this)
  }

  private evaluate(expr: Expr): Instance {
    this.locator = expr.locator
    if (expr instanceof ValueExpr) {
      return expr.accept(this)
    } else {
      return this.evaluateRef(expr).get()
    }
  }

  execute(stmt: Stmt): Completion {
    this.locator = stmt.locator
    return stmt.accept(this)
  }

  executeInEnvironment(stmts: Stmt[], excEnv: Environment)
    : Completion {
    const prevEnv = this.environment
    this.environment = excEnv
    let lastCompletion: Completion = new NormalCompletion()
    for (const curStmt of stmts) {
      lastCompletion = this.execute(curStmt)
      if (!lastCompletion.isNormal()) break
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
    this.waitForNextStep(expr.locator)
    l.set(r)
    return r
  }
  visitArrayValueExpr(expr: ArrayValueExpr): Instance {
    const arr: Instance[] = []
    for (const e of expr.elements) {
      arr.push(this.evaluate(e))
    }
    return new ArrayInstance(ArrayClass.get(), arr)
  }
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr)
    : Instance {
    const r = this.evaluate(expr.right)
    switch (expr.operator) {
      case Operator.PLUS:
        return r.callMagicMethod(MagicMethod.__pos__, [], this)
      case Operator.MINUS:
        return r.callMagicMethod(MagicMethod.__neg__, [], this)
      default:
        throw new Error('TODO: Internal.')
    }
  }
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): Instance {
    const r = this.evaluate(expr.right)
    // Converts value to bool and then negates it.
    const boolRes = (r.callMagicMethod(
      MagicMethod.__bool__, [], this)).castOrThrow(BoolInstance)
    return (boolRes.value) ? BoolInstance.getFalse() : BoolInstance.getTrue()
  }
  visitBinaryValueExpr(expr: BinaryValueExpr): Instance {
    const l = this.evaluate(expr.left)
    const r = this.evaluate(expr.right)

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
          const lRes = (l.callMagicMethod(
            MagicMethod.__bool__, [], this)).castOrThrow(BoolInstance)
          if (!lRes.value) return lRes
          else return r.callMagicMethod(MagicMethod.__bool__, [], this)
        }
      case Operator.OR:
        {
          const lRes = (l.callMagicMethod(
            MagicMethod.__bool__, [], this)).castOrThrow(BoolInstance)
          if (lRes.value) return lRes
          else return r.callMagicMethod(MagicMethod.__bool__, [], this)
        }
      default:
        throw Error('TODO: Internal.')
    }
  }

  visitExprStmt(stmt: ExprStmt): Completion {
    this.evaluate(stmt.expr)
    return new NormalCompletion()
  }

  visitCallValueExpr(expr: CallValueExpr): Instance {
    const args = []
    for (const arg of expr.args) {
      args.push(this.evaluate(arg))
    }
    this.waitForNextStep(expr.locator)
    return (this.evaluate(expr.callee))
      .callMagicMethod(MagicMethod.__call__, args, this)
  }

  visitVariableRefExpr(expr: VariableRefExpr): ValueRef {
    return this.environment.getRef(expr.name)
  }
  visitSquareAccessorRefExpr(expr: SquareAccessorRefExpr)
    : ValueRef {
    const arr = this.evaluate(expr.object)
    const key = this.evaluate(expr.property)
    return {
      set: (value: Instance) =>
        arr.callMagicMethod(MagicMethod.__setitem__, [key, value], this),
      get: () => arr.callMagicMethod(MagicMethod.__getitem__, [key], this),
    }
  }
  visitDotAccessorRefExpr(expr: DotAccessorRefExpr): ValueRef {
    return (this.evaluate(expr.object)).getRef(expr.property)
  }
  visitEmptyStmt(_: EmptyStmt): Completion {
    return new NormalCompletion()
  }

  visitIfStmt(stmt: IfStmt): Completion {
    this.waitForNextStep(stmt.condition.locator)

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

    this.waitForNextStep(stmt.condition.locator)
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      lastCompletion = this.execute(stmt.body)
      if (lastCompletion.isBreak() || lastCompletion.isReturn()) {
        break
      }
      this.waitForNextStep(stmt.condition.locator)
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
    if (stmt.condition !== null) {
      this.waitForNextStep(stmt.condition.locator)
    }
    while (stmt.condition === null
      || this.isTruthy(this.evaluate(stmt.condition))) {
      lastCompletion = this.execute(stmt.body)
      if (lastCompletion.isBreak() || lastCompletion.isReturn()) {
        break
      }
      for (const expr of stmt.increments) this.evaluate(expr)

      if (stmt.condition !== null) {
        this.waitForNextStep(stmt.condition.locator)
      }
    }

    this.environment = prevEnv
    if (lastCompletion.isReturn()) return lastCompletion
    else return new NormalCompletion()
  }

  visitFunctionDeclStmt(stmt: FunctionDeclStmt): Completion {
    const func = new UserFunctionInstance(
      UserFunctionClass.get(),
      stmt,
      this.environment,
      stmt.name
    )
    this.environment.getRef(stmt.name).set(func)
    return new NormalCompletion()
  }
  visitClassDefStmt(stmt: ClassDefStmt): Completion {
    let base: Class = ObjectClass.get()
    if (stmt.baseName) {
      const baseInstance = this.environment.get(stmt.baseName)
      if (baseInstance instanceof Class) {
        base = baseInstance as Class
      } else {
        throw new Error(`"${stmt.baseName}" does not denote a class.`)
      }
    }

    this.environment.getRef(stmt.name)
      .set(new UserClass(stmt.name, base, stmt.methods, this.environment))
    return new NormalCompletion()
  }
  visitCompletionStmt(stmt: CompletionStmt): Completion {
    let retVal: Completion = new NormalCompletion()
    if (stmt.completionType === CompletionType.RETURN) {
      const value =
        stmt.right !== null
          ? this.evaluate(stmt.right)
          : NoneInstance.getInstance()
      retVal = new ReturnCompletion(value)
    } else if (stmt.completionType === CompletionType.BREAK) {
      retVal = new BreakCompletion()
    } else if (stmt.completionType === CompletionType.CONTINUE) {
      retVal = new ContinueCompletion()
    } else {
      retVal = new NormalCompletion()
    }
    this.waitForNextStep(stmt.locator)
    return retVal
  }
  visitProgramStmt(stmt: ProgramStmt): Completion {
    /* TODO: Hoisting? i.e. separate fncs, classes, stmts. */
    try {
      for (const s of stmt.body) {
        this.execute(s)
      }
    } catch (e) {
      const exceptionMsg = (e as Error).message
      const callstackMsg =
        `Callstack:\n${this.callStack.slice().reverse().join('\n')}`
      throw new RuntimeError(this.locator, `${exceptionMsg}\n${callstackMsg}`)
    }
    return new NormalCompletion()
  }

  isTruthy(r: Instance): boolean {
    const boolRes = r.callMagicMethod(MagicMethod.__bool__, [], this)
    // TODO: Enforce boolRes type
    return (boolRes as BoolInstance).value
  }
}
