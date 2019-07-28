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
  ClassDeclStmt,
  CompletionStmt,
  EmptyStmt,
  ForStmt,
  FunctionDeclStmt,
  IfStmt,
  ProgramStmt,
  Stmt,
  VisitorStmt,
  WhileStmt
} from './stmt'
import { Environment } from './environment'
import { NoneValue, NumberValue, StringValue, Value } from './value'
import { Completion } from './completion'
import { ValueReference } from './exec-state'

class Interpreter
  implements
    VisitorRefExpr<ValueReference>,
    VisitorValueExpr<Value>,
    VisitorStmt<Completion> {
  private readonly globals: Environment
  private environment: Environment
  constructor() {
    this.globals = new Environment(null)
    this.environment = this.globals
  }

  private evaluateRef(expr: RefExpr): ValueReference {
    return expr.accept(this)
  }

  private evaluate(expr: Expr): Value {
    if (expr instanceof ValueExpr) {
      return expr.accept(this)
    } else {
      return this.evaluateRef(expr).value()
    }
  }

  private execute(stmt: Stmt): Completion {
    return stmt.accept(this)
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
    throw new Error('Method not implemented.')
  }
  visitArrayValueExpr(expr: ArrayValueExpr): Value {
    throw new Error('Method not implemented.')
  }
  visitUnaryPlusMinusValueExpr(expr: UnaryPlusMinusValueExpr): Value {
    throw new Error('Method not implemented.')
  }
  visitUnaryNotValueExpr(expr: UnaryNotValueExpr): Value {
    throw new Error('Method not implemented.')
  }
  visitBinaryValueExpr(expr: BinaryValueExpr): Value {
    throw new Error('Method not implemented.')
  }
  visitLogicalValueExpr(expr: LogicalValueExpr): Value {
    throw new Error('Method not implemented.')
  }
  visitCallValueExpr(expr: CallValueExpr): Value {
    throw new Error('Method not implemented.')
  }

  visitVariableRefExpr(expr: VariableRefExpr): ValueReference {
    throw new Error('Method not implemented.')
  }
  visitSquareAccessorRefExpr(expr: SquareAccessorRefExpr): ValueReference {
    throw new Error('Method not implemented.')
  }
  visitDotAccessorRefExpr(expr: DotAccessorRefExpr): ValueReference {
    throw new Error('Method not implemented.')
  }
  visitEmptyStmt(stmt: EmptyStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitIfStmt(stmt: IfStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitBlockStmt(stmt: BlockStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitWhileStmt(stmt: WhileStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitForStmt(stmt: ForStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitFunctionDeclStmt(stmt: FunctionDeclStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitClassDeclStmt(stmt: ClassDeclStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitCompletionStmt(stmt: CompletionStmt): Completion {
    throw new Error('Method not implemented.')
  }
  visitProgramNode(stmt: ProgramStmt): Completion {
    throw new Error('Method not implemented.')
  }
}

export { Interpreter }
