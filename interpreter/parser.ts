import { CompletionType } from './ast/completion'
import * as Expr from './ast/expr'
import { parser } from './ast/giflang.jison'
import { Operator } from './ast/operator'
import * as Sign from './ast/sign'
import * as Stmt from './ast/stmt'

export function ParseGiflang(input: string): Stmt.ProgramStmt {
  parser.yy = {
    Expr,
    Stmt,
    Operator,
    CompletionType,
    Sign,
  }
  return parser.parse(input)
}
