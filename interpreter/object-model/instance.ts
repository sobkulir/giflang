import { FunctionDeclExpr } from '../ast/expr'
import { CodeExecuter } from '../code-executer'
import { Environment } from '../environment'
import { BoolClass, CheckArityEq, Class, NoneClass, WrappedFunctionClass } from './class'
import { MagicMethod } from './magic-method'

// Since JavaScript doesn't have pointers or references, we represent
// a value reference as an object that can get or set the value.
// Both get and set methods are closures.
export interface ValueRef {
  get(): Instance
  set(value: Instance): void
}

export type TWrappedFunction = (
  interpreter: CodeExecuter,
  args: Instance[],
) => Instance

// The core class, all Giflang runtime objects are instances of `Instance`.
export class Instance {
  public fields: Map<string, Instance> = new Map()
  private static nextId: number = 0
  public id: number

  // Caller is responsible for setting the klass.
  constructor(public klass: Class | null) {
    this.id = Instance.nextId++
  }

  getKlass(): Class {
    if (this.klass instanceof Class) {
      return this.klass
    } else {
      throw new Error('Internal error: Instance has no klass.')
    }
  }

  // Gets a field named `name`. Firstly, the instance's fields are
  // looked through. After that instance's `klass` and its bases.
  // If the field is a function, the instance is bound to it.
  getOrThrow(name: string): Instance {
    if (this.klass == null) throw Error('Internal error: klass === null')

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
      throw new Error(`Instance does not have a property ${name}.`)
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

  // Casts instance to TConstructor or if it is not an instance
  // of TConstructor, throws.
  castOrThrow<T extends Instance>(TConstructor: new (...args: any[]) => T): T {
    if (this instanceof TConstructor) {
      return this as T
    } else {
      throw new Error('Invalid cast')
    }
  }

  // Calls a magic method and binds 'this'. The resolution of `functionName`
  // starts at the instances klass.
  callMagicMethod(
    functionName: MagicMethod,
    args: Instance[],
    interpreter: CodeExecuter
  ): Instance {
    const method = this.getKlass().getInBases(functionName)
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
        throw new Error(`${functionName} is not callable.`)
      }
    } else {
      throw new Error(`${functionName} not defined.`)
    }
  }
}

export class ObjectInstance extends Instance {
  constructor(klass: Class) {
    super(klass)
  }
}

export class NoneInstance extends Instance {
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

abstract class FunctionInstance extends Instance {
  abstract call(interpreter: CodeExecuter, args: Instance[]): Instance

  // Returns true if the method is already bound.
  abstract isBound(): boolean

  // Gets the original function name.
  abstract getName(): string

  // Return a new function, but it has `argToBind` bound as
  // its first argument.
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

export class UserFunctionInstance extends FunctionInstance {
  constructor(
    klass: Class,
    private readonly functionDef: FunctionDeclExpr,
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
    } else if (completion.isNormal()) {
      return NoneInstance.getInstance()
    } else {
      throw new Error('Cannot continue or break from a function.')
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

export class WrappedFunctionInstance extends FunctionInstance {
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

export class BoolInstance extends Instance {
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

export class StringInstance extends Instance {
  constructor(klass: Class, public value: string) {
    super(klass)
  }
}

export class NumberInstance extends Instance {
  constructor(klass: Class, public value: number) {
    super(klass)
  }
}

export class ArrayInstance extends Instance {
  constructor(klass: Class, public values: Instance[]) {
    super(klass)
  }
}
