import { FunctionDeclStmt } from '../ast/stmt'
import { Environment } from '../environment'
import { Interpreter } from '../interpreter'
import { Class } from './class'
import { Natives } from './natives'

class Instance {
  public fields: Map<string, Instance> = new Map()

  // Caller is responsible for setting the klass.
  constructor(public klass: Class | null) { }

  getClass(): Class {
    if (this.klass instanceof Class) {
      return this.klass
    } else {
      throw new Error('Internal error: Instance has no klass.')
    }
  }

  has(name: string): boolean {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    return this.fields.has(name) || this.klass.has(name)
  }

  get(name: string): Instance {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    if (this.fields.has(name)) {
      return this.fields.get(name) as Instance
    }

    if (this.klass.has(name)) {
      return this.klass.get(name)
    }

    // Maybe return null?
    throw Error('TODO')
  }

  set(name: string, value: Instance) {
    this.fields.set(name, value)
  }

  castOrThrow<T extends Instance>(TConstructor: new (...args: any[]) => T): T {
    if (this instanceof TConstructor) {
      return this as T
    } else {
      throw new Error('TODO: Invalid cast')
    }
  }

  callMagicMethod(
    functionName: string,
    args: Instance[],
    interpreter: Interpreter
  ): Instance {
    if (this.getClass().has(functionName)) {
      const method = this.getClass().get(functionName)
      if (method instanceof FunctionInstance) {
        return method.call(interpreter, args)
      } else {
        throw new Error('TODO: ToString(this.{functionName}) is not callable.')
      }
    } else {
      throw new Error('TODO: {functionName} not defined.')
    }
  }
}

class ObjectInstance extends Instance {
  constructor(klass: Class) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type ObjectClass.
    super(klass)
  }
}

abstract class FunctionInstance extends ObjectInstance {
  abstract call(interpreter: Interpreter, args: Instance[]): Instance
}

class UserFunctionInstance extends FunctionInstance {
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
      // TODO: getRef is recursive, introduce "shallowSet"
      environment.getRef(params[i]).set(args[i])
    }

    const completion = interpreter.executeInEnvironment(
      this.functionDef.body.stmts,
      environment
    )
    if (completion.isReturn()) {
      return completion.value
    } else {
      return Natives.getInstance().getNone()
    }
  }
}

type TWrappedFunction = (
  interpreter: Interpreter,
  args: Instance[],
) => Instance

class WrappedFunctionInstance extends FunctionInstance {
  constructor(klass: Class, public wrappedFunction: TWrappedFunction) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type WrappedFunctionClass.
    super(klass)
  }

  call(interpreter: Interpreter, args: Instance[]): Instance {
    // TODO: Check arity.
    return this.wrappedFunction(interpreter, args)
  }
}

export { Instance, WrappedFunctionInstance, FunctionInstance, UserFunctionInstance, ObjectInstance }

