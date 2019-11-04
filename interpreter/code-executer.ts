import { JisonLocator } from './ast/ast-node'
import { Completion } from './ast/completion'
import { Stmt } from './ast/stmt'
import { Environment } from './environment'

interface CodeExecuter {
  executeInEnvironment(stmts: Stmt[], excEnv: Environment): Completion
  callStack: string[]
  locator: JisonLocator
}

export { CodeExecuter }

