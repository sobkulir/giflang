import { CodeExecuter } from '../../code-executer'
import { CheckArityEq, StringClass } from '../class'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from '../instance'
import { MagicMethod } from '../magic-method'

export function Stringify(interpreter: CodeExecuter, ...args: Instance[])
  : string[] {
  return args.map((arg) => ((arg.callMagicMethod(
    MagicMethod.__str__, [], interpreter)).castOrThrow(StringInstance)
    .value
  ))
}

export type PrintFunction = (str: string) => void
export type InputFunction = () => Promise<string>

export function GiflangPrint(print: PrintFunction)
  : TWrappedFunction {
  return (interpreter: CodeExecuter, args: Instance[])
    : Instance => {
    print((Stringify(interpreter, ...args)).join(' ') + '\n')
    return NoneInstance.getInstance()
  }
}

export function GiflangInput(input: InputFunction)
  : TWrappedFunction {
  return (_interpreter: CodeExecuter, args: Instance[])
    : StringInstance => {
    CheckArityEq(args, 0)
    return new StringInstance(StringClass.get(), 'INPUT')
  }
}
