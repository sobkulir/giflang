import { Class } from './object-model/class'
import { MetaClass } from './object-model/meta-class'
import { ObjectClass } from './object-model/object-class'
import { WrappedFunctionClass } from './object-model/wrapped-function-class'
import { UserFunctionClass } from './object-model/user-function-class'
import { NoneClass } from './object-model/none-class'
import { Instance } from './object-model/instance'
import { ObjectInstance } from './object-model/object-instance'
import { NumberClass } from './object-model/std/number-class'
import { NumberInstance } from './object-model/std/number-instance'
import { StringInstance } from './object-model/std/string-instance'
import { StringClass } from './object-model/std/string-class'
import { UserFunctionInstance } from './object-model/user-function-instance'
import { FunctionDeclStmt } from './ast/stmt'
import { Environment } from './environment'

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
      new UserFunctionClass(metaClass, wrappedFunctionClass),
    ],
    [nameof(NoneClass), new NoneClass(metaClass)],
    [nameof(NumberClass), new NumberClass(metaClass)],
  ]
}

class NativesHelper {
  readonly natives: Map<string, Class>
  constructor() {
    this.natives = new Map(CreateNativeClasses())
  }

  private getNative<T>(TConstructor: new (...args: any[]) => T): Class {
    return this.natives.get(TConstructor.name) as Class
  }

  getNone(): ObjectInstance {
    return this.getNative(NoneClass).createBlankUserInstance()
  }

  createNumber(value: number): NumberInstance {
    return new NumberInstance(this.getNative(NumberClass), value)
  }

  createString(value: string): StringInstance {
    return new StringInstance(this.getNative(StringClass), value)
  }

  createUserFunction(
    functionDef: FunctionDeclStmt,
    closure: Environment,
  ): UserFunctionInstance {
    return new UserFunctionInstance(
      this.getNative(UserFunctionClass),
      functionDef,
      closure,
    )
  }
}

export { NativesHelper }
