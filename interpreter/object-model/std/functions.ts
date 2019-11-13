import { CodeExecuter } from '../../code-executer'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from '../instance'
import { MagicMethod } from '../magic-method'

async function Stringify(interpreter: CodeExecuter, args: Instance[])
  : Promise<string[]> {
  return Promise.all(
    args.map(async (arg) => ((await arg.callMagicMethod(
      MagicMethod.__str__, [], interpreter)).castOrThrow(StringInstance)
      .value
    )))
}

type PrintFunction = (str: string) => void

function GiflangPrint(print: PrintFunction)
  : TWrappedFunction {
  return async (interpreter: CodeExecuter, args: Instance[])
    : Promise<Instance> => {
    print((await Stringify(interpreter, args)).join(' ') + '\n')
    return NoneInstance.getInstance()
  }
}

export { GiflangPrint, PrintFunction, Stringify }

