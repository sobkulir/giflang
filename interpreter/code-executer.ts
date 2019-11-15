import { JisonLocator } from './ast/ast-node'
import { Completion } from './ast/completion'
import { Stmt } from './ast/stmt'
import { Environment } from './environment'

export interface CodeExecuter {
  executeInEnvironment(stmts: Stmt[], excEnv: Environment): Promise<Completion>
  callStack: string[]
  locator: JisonLocator
}
