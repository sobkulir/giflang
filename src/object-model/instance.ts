import { FunctionDeclStmt } from '../ast/stmt'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { BoolClass, CheckArityEq, Class, NoneClass, WrappedFunctionClass } from './class'
import { MagicMethod } from './magic-method'

interface ValueRef {
  set(value: Instance): void
  get(): Instance
}

class Instance {
  public fields: Map<string, Instance> = new Map()
  private static nextId: number = 0
  public id: number

  // Caller is responsible for setting the klass.
  constructor(public klass: Class | null) {
    this.id = Instance.nextId++
  }

  getClass(): Class {
    if (this.klass instanceof Class) {
      return this.klass
    } else {
      throw new Error('Internal error: Instance has no klass.')
    }
  }

  getOrThrow(name: string): Instance {
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
      throw new Error(`TODO: Instance does not have ${name}`)
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

  // Calls magic method and binds 'this'.
  callMagicMethod(
    functionName: MagicMethod,
    args: Instance[],
    interpreter: CodeExecuter
  ): Instance {
    const method = this.getClass().getInBases(functionName)

    if (method) {
      if (method instanceof FunctionInstance) {

        let descriptiveName = ''
        if (this instanceof FunctionInstance) {
          descriptiveName = this.getName()
        } else {
          descriptiveName = method.getName()
        }

        interpreter.callStack.push(
          `${descriptiveName} called at line ${interpreter.locator.first_line}`)
        const retValue = method.bind(this).call(interpreter, args)
        interpreter.callStack.pop()
        return retValue
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

  // Returns true if method has "this" bound.
  abstract isBound(): boolean

  // Gets original function name.
  abstract getName(): string

  bind(argToBind: Instance): FunctionInstance {
    if (this.isBound()) return this

    return new WrappedFunctionInstance(
      WrappedFunctionClass.get(),
      (interpreter: CodeExecuter,
        args: Instance[]): Instance => {
        const boundArgs = args.slice()
        boundArgs.unshift(argToBind)
        return this.call(interpreter, boundArgs)
      },
      this.getName(),
      /* bound = */ true,
    )
  }
}

class UserFunctionInstance extends FunctionInstance {
  constructor(
    klass: Class,
    private readonly functionDef: FunctionDeclStmt,
    private readonly closure: Environment,
    private readonly name: string,
  ) {
    super(klass)
  }

  call(interpreter: CodeExecuter, args: Instance[]): Instance {
    const environment = new Environment(this.closure)
    const params = this.functionDef.parameters
    CheckArityEq(args, params.length)

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

  // UserFunctionInstance can't be bound.
  isBound(): boolean {
    return false
  }

  getName(): string {
    return this.name
  }
}

type TWrappedFunction = (
  interpreter: CodeExecuter,
  args: Instance[],
) => Instance

class WrappedFunctionInstance extends FunctionInstance {
  constructor(
    klass: Class,
    public wrappedFunction: TWrappedFunction,
    private readonly name: string,
    private readonly bound: boolean = false) {
    super(klass)
  }

  call(interpreter: CodeExecuter, args: Instance[]): Instance {
    return this.wrappedFunction(interpreter, args)
  }

  isBound(): boolean {
    return this.bound
  }

  getName(): string {
    return this.name
  }
}

class BoolInstance extends ObjectInstance {
  constructor(boolClass: BoolClass, readonly value: boolean) {
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
  constructor(klass: Class, public value: string) {
    super(klass)
  }
}

export { Instance, ValueRef, BoolInstance, WrappedFunctionInstance, FunctionInstance, NoneInstance, UserFunctionInstance, ObjectInstance, TWrappedFunction, StringInstance }

