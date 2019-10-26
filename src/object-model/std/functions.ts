import { CodeExecuter } from '../../code-executer'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from '../instance'
import { MagicMethods } from '../magic-methods'

function GiflangPrint(print: (str: string) => void): TWrappedFunction {
  return (interpreter: CodeExecuter, args: Instance[]): Instance => {
    print(args
      .map(
        (arg) =>
          (arg.callMagicMethod(
            MagicMethods.__str__, [], interpreter) as StringInstance)
            .value
      )
      .join(' '))
    return NoneInstance.getInstance()
  }
}

export { GiflangPrint }

