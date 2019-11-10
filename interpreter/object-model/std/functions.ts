import { CodeExecuter } from '../../code-executer'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from '../instance'
import { MagicMethod } from '../magic-method'

function Stringify(interpreter: CodeExecuter, args: Instance[])
  : string[] {
  return args.map((arg) => (arg.callMagicMethod(
    MagicMethod.__str__, [], interpreter).castOrThrow(StringInstance)
    .value
  ))
}

type PrintFunction = (str: string) => void

function GiflangPrint(print: PrintFunction): TWrappedFunction {
  return (interpreter: CodeExecuter, args: Instance[]): Instance => {
    print(Stringify(interpreter, args).join(' ') + '\n')
    return NoneInstance.getInstance()
  }
}

export { GiflangPrint, PrintFunction, Stringify }

