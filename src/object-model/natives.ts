import { FunctionDeclStmt } from '../ast/stmt'
import { Environment } from '../environment'
import { Interpreter } from '../interpreter'
import { Class, MetaClass, NoneClass, ObjectClass, UserFunctionClass, WrappedFunctionClass } from './class'
import { Instance, ObjectInstance, UserFunctionInstance } from './instance'
import { NumberClass } from './std/number-class'
import { NumberInstance } from './std/number-instance'
import { StringClass } from './std/string-class'
import { StringInstance } from './std/string-instance'

class Natives {
  private static instance: Natives
  readonly classes: Map<string, Class>
  // readonly functions: Map<string, FunctionInstance>

  private constructor() {
    this.classes = new Map(CreateNativeClasses())
  }

  public static Initialize() {
    if (!Natives.instance) {
      Natives.instance = new Natives()
    }
  }

  public static getInstance(): Natives {
    if (!Natives.instance) {
      throw Error('Natives was not initialized.')
    }
    return Natives.instance
  }

  public getClass<T>(TConstructor: new (...args: any[]) => T): Class {
    return this.classes.get(TConstructor.name) as Class
  }

  getNone(): ObjectInstance {
    return this.getClass(NoneClass).createBlankUserInstance()
  }

  createNumber(value: number): NumberInstance {
    return new NumberInstance(this.getClass(NumberClass), value)
  }

  createString(value: string): StringInstance {
    return new StringInstance(this.getClass(StringClass), value)
  }

  createUserFunction(
    functionDef: FunctionDeclStmt,
    closure: Environment
  ): UserFunctionInstance {
    return new UserFunctionInstance(
      this.getClass(UserFunctionClass),
      functionDef,
      closure
    )
  }
}

function CreateNativeClasses(): Array<[string, Class]> {
  // Initial bootstrapping.
  const metaClass = new MetaClass()
  const objectClass = new ObjectClass(metaClass)
  metaClass.base = objectClass
  // Classes that others depend on.
  const wrappedFunctionClass = new WrappedFunctionClass(metaClass)

  return [
    [nameof(MetaClass), metaClass],
    [nameof(ObjectClass), objectClass],
    [nameof(WrappedFunctionClass), wrappedFunctionClass],
    [
      nameof(UserFunctionClass),
      new UserFunctionClass(metaClass, wrappedFunctionClass)
    ],
    [nameof(NoneClass), new NoneClass(metaClass)],
    [nameof(NumberClass), new NumberClass(metaClass, wrappedFunctionClass)]
  ]
}

function GiflangPrint(interpreter: Interpreter, args: Instance[]): Instance {
  console.log(
    args
      .map(
        (arg) =>
          (arg.callMagicMethod('__str__', [arg], interpreter) as StringInstance)
            .value
      )
      .join(' ')
  )
  return Natives.getInstance().getNone()
}

export { Natives, GiflangPrint }

