import { parser } from './giflang.jison'
import * as Expr from './expr'
import * as Stmt from './stmt'
import { Operator } from './operator'
import { CompletionType } from './completion'

function ParseGiflang(input: string) {
  parser.yy = {
    Expr,
    Stmt,
    Operator,
    CompletionType,
  }
  return parser.parse(input)
}

export { ParseGiflang }
