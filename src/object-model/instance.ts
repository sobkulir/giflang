import { FunctionDeclStmt } from '../ast/stmt'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { BoolClass, Class, NoneClass } from './class'

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
    interpreter: CodeExecuter
  ): Instance {
    if (this.getClass().has(functionName)) {
      const method = this.getClass().get(functionName)
      if (method instanceof FunctionInstance) {
        return method.call(interpreter, args)
      } else {
        throw new Error(`TODO: ToString(${functionName}) is not callable.`)
      }
    } else {
      throw new Error(`TODO: ${functionName} not defined.`)
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

class NoneInstance extends Instance {
  private constructor(noneClass: NoneClass) {
    super(noneClass)
  }
  private static instance: NoneInstance
  static getInstance() {
    if (!NoneInstance.instance) {
      NoneInstance.instance = new NoneInstance(NoneClass.get())
    }
    return NoneInstance.instance
  }
}

abstract class FunctionInstance extends ObjectInstance {
  abstract call(interpreter: CodeExecuter, args: Instance[]): Instance
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

  call(interpreter: CodeExecuter, args: Instance[]): Instance {
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
      return NoneInstance.getInstance()
    }
  }
}

type TWrappedFunction = (
  interpreter: CodeExecuter,
  args: Instance[],
) => Instance

class WrappedFunctionInstance extends FunctionInstance {
  constructor(klass: Class, public wrappedFunction: TWrappedFunction) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type WrappedFunctionClass.
    super(klass)
  }

  call(interpreter: CodeExecuter, args: Instance[]): Instance {
    // TODO: Check arity.
    return this.wrappedFunction(interpreter, args)
  }
}

class BoolInstance extends ObjectInstance {
  private constructor(boolClass: BoolClass, readonly value: boolean) {
    super(boolClass)
  }
  private static trueInstance: BoolInstance
  private static falseInstance: BoolInstance
  static getTrue() {
    if (!BoolInstance.trueInstance) {
      BoolInstance.trueInstance = new BoolInstance(BoolClass.get(), true)
    }
    return BoolInstance.trueInstance
  }
  static getFalse() {
    if (!BoolInstance.falseInstance) {
      BoolInstance.falseInstance = new BoolInstance(BoolClass.get(), false)
    }
    return BoolInstance.falseInstance
  }
}

class StringInstance extends ObjectInstance {
  constructor(klass: Class, readonly value: string) {
    // TODO:  Enforce at runtime that any one of klass.base
    //        (recursively) is of type StringClass.
    super(klass)
  }
}

export { Instance, BoolInstance, WrappedFunctionInstance, FunctionInstance, NoneInstance, UserFunctionInstance, ObjectInstance, TWrappedFunction, StringInstance }

