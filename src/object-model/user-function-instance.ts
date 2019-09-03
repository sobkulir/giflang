import { Instance } from './instance'
import { UserFunctionClass } from './user-function-class'
import { Interpreter } from '../interpreter'
import { FunctionDeclStmt } from '../stmt'
import { Environment } from '../environment'
import { CompletionType } from '../completion'
import { FunctionInstance } from './function-instance'
import { ObjectInstance } from './object-instance'
import { ObjectClass } from './object-class'

class UserFunctionInstance extends ObjectInstance implements FunctionInstance {
  constructor(
    userFunctionClass: UserFunctionClass,
    readonly functionDef: FunctionDeclStmt,
    readonly closure: Environment,
  ) {
    super(userFunctionClass.base as ObjectClass)
  }

  call(interpreter: Interpreter, args: Instance[]): Instance {
    const environment = new Environment(this.closure)
    // TODO: Check arity.
    const params = this.functionDef.parameters
    for (let i = 0; i < params.length; ++i) {
      environment.getRef(params[i]).set(args[i])
    }

    const completion = interpreter.executeInEnvironment(
      this.functionDef.body.stmts,
      environment,
    )
    if (completion.isReturn()) {
      return completion.value
    } else {
      return /* TODO: Create NoneInstance */
    }
  }
}

export { UserFunctionInstance }
