import { CodeExecuter } from '../../code-executer'
import { CheckArityEq, StringClass } from '../class'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from '../instance'
import { MagicMethod } from '../magic-method'

export async function Stringify(interpreter: CodeExecuter, ...args: Instance[])
  : Promise<string[]> {
  return Promise.all(
    args.map(async (arg) => ((await arg.callMagicMethod(
      MagicMethod.__str__, [], interpreter)).castOrThrow(StringInstance)
      .value
    )))
}

export type PrintFunction = (str: string) => void
export type InputFunction = () => Promise<string>

export function GiflangPrint(print: PrintFunction)
  : TWrappedFunction {
  return async (interpreter: CodeExecuter, args: Instance[])
    : Promise<Instance> => {
    print((await Stringify(interpreter, ...args)).join(' ') + '\n')
    return NoneInstance.getInstance()
  }
}

export function GiflangInput(input: InputFunction)
  : TWrappedFunction {
  return async (_interpreter: CodeExecuter, args: Instance[])
    : Promise<StringInstance> => {
    CheckArityEq(args, 0)
    return new StringInstance(StringClass.get(), await input())
  }
}
