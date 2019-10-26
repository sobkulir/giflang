import { FunctionDeclStmt } from '../ast/stmt'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { BoolClass, Class, NoneClass, WrappedFunctionClass } from './class'
import { MagicMethod } from './magic-method'

interface ValueRef {
  set(value: Instance): void
  get(): Instance
}

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

  getOrThrow(name: string): Instance {
    // TODO: This is ugly.
    if (this.klass == null) throw Error('Internal -- klass == null')

    let value: Instance | null = null
    if (this.fields.has(name)) {
      value = this.fields.get(name) as Instance
    } else {
      value = (this.klass as Class).getInBases(name)
    }

    if (value instanceof FunctionInstance) {
      value = value.bind(this)
    }

    if (value) {
      return value
    } else {
      throw new Error('TODO: Instance does not have ${name}')
    }
  }

  set(name: string, value: Instance) {
    this.fields.set(name, value)
  }

  getRef(name: string): ValueRef {
    return {
      set: (value: Instance) => this.set(name, value),
      get: () => this.getOrThrow(name),
    }
  }

  castOrThrow<T extends Instance>(TConstructor: new (...args: any[]) => T): T {
    if (this instanceof TConstructor) {
      return this as T
    } else {
      throw new Error('TODO: Invalid cast')
    }
  }

  // Calls magic method and adds this to args.
  callMagicMethod(
    functionName: MagicMethod,
    args: Instance[],
    interpreter: CodeExecuter
  ): Instance {
    const method = this.getClass().getInBases(functionName)
    if (method) {
      if (method instanceof FunctionInstance) {
        args.unshift(this)
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

class NoneInstance extends ObjectInstance {
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
  bind(argToBind: Instance): FunctionInstance {
    return new WrappedFunctionInstance(
      WrappedFunctionClass.get(),
      (interpreter: CodeExecuter,
        args: Instance[]): Instance => {
        args.unshift(argToBind)
        return this.call(interpreter, args)
      }
    )
  }
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
      environment.shallowSet(params[i], args[i])
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

export { Instance, ValueRef, BoolInstance, WrappedFunctionInstance, FunctionInstance, NoneInstance, UserFunctionInstance, ObjectInstance, TWrappedFunction, StringInstance }

