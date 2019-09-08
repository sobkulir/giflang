import { parser } from './ast/giflang.jison'
import * as Expr from './ast/expr'
import * as Stmt from './ast/stmt'
import { Operator } from './ast/operator'
import { CompletionType } from './ast/completion'

function ParseGiflang(input: string): Stmt.ProgramStmt {
  parser.yy = {
    Expr,
    Stmt,
    Operator,
    CompletionType,
  }
  return parser.parse(input)
}

export { ParseGiflang }
