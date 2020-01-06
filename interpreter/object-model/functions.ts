import { CodeExecuter } from '../code-executer'
import { CheckArityEq, StringClass } from './class'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from './instance'
import { MagicMethod } from './magic-method'

// Calls `__str__` magic method on all `args` and returns the resulting strings.
export function Stringify(interpreter: CodeExecuter, ...args: Instance[])
  : string[] {
  return args.map((arg) => ((arg.callMagicMethod(
    MagicMethod.__str__, [], interpreter)).castOrThrow(StringInstance)
    .value
  ))
}

export type PrintFunction = (str: string) => void
export type InputFunction = () => string

export function GiflangPrint(print: PrintFunction, end: string)
  : TWrappedFunction {
  return (interpreter: CodeExecuter, args: Instance[])
    : Instance => {
    print((Stringify(interpreter, ...args)).join(' ') + end)
    return NoneInstance.getInstance()
  }
}

export function GiflangInput(input: InputFunction)
  : TWrappedFunction {
  return (_interpreter: CodeExecuter, args: Instance[])
    : StringInstance => {
    CheckArityEq(args, 0)
    return new StringInstance(StringClass.get(), input())
  }
}
