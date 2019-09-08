import { Instance } from './instance'
import { UserFunctionClass } from './user-function-class'
import { Interpreter } from '../interpreter'
import { FunctionDeclStmt } from '../ast/stmt'
import { Environment } from '../environment'
import { FunctionInstance } from './function-instance'
import { ObjectInstance } from './object-instance'
import { ObjectClass } from './object-class'
import { Class } from './class'

class UserFunctionInstance extends ObjectInstance implements FunctionInstance {
  constructor(
    klass: Class,
    public functionDef: FunctionDeclStmt,
    public closure: Environment,
  ) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type UserFunctionClass.
    super(klass)
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
      return interpreter.natives.getNone()
    }
  }
}

export { UserFunctionInstance }
