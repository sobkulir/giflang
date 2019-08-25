import { FunctionDeclStmt } from './stmt'
import { Interpreter } from './interpreter'
import { Environment } from './environment'
import { Completion } from './completion'

const enum Type {
  None,
  Bool,
  String,
  Number,
  Object,
  Function,
}

abstract class Value {
  constructor(readonly type: Type) {}

  isFunction(): this is FunctionValue {
    return this instanceof FunctionValue
  }

  isString(): this is StringValue {
    return this instanceof StringValue
  }

  isNumber(): this is NumberValue {
    return this instanceof NumberValue
  }

  isBool(): this is BoolValue {
    return this instanceof BoolValue
  }

  isNone(): this is NoneValue {
    return this instanceof NoneValue
  }
}

class NumberValue extends Value {
  constructor(readonly value: number) {
    super(Type.Number)
  }
}

class StringValue extends Value {
  constructor(readonly value: string) {
    super(Type.String)
  }
}

class BoolValue extends Value {
  constructor(readonly value: boolean) {
    super(Type.Bool)
  }
}

class FunctionValue extends Value {
  constructor(
    readonly functionDef: FunctionDeclStmt,
    readonly closure: Environment,
  ) {
    super(Type.Function)
  }

  call(interpreter: Interpreter, args: Value[]): Completion {
    const environment = new Environment(this.closure)
    // TODO: Check arity.
    const params = this.functionDef.parameters
    for (let i = 0; i < params.length; ++i) {
      environment.getRef(params[i]).set(args[i])
    }

    return interpreter.executeInEnvironment(
      this.functionDef.body.stmts,
      environment,
    )
  }
}

class NoneValue extends Value {
  constructor() {
    super(Type.None)
  }
}

export {
  Type,
  Value,
  NumberValue,
  BoolValue,
  StringValue,
  FunctionValue,
  NoneValue
}
