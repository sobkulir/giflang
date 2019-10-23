import { CodeExecuter } from '../../code-executer'
import { Instance, NoneInstance, StringInstance, TWrappedFunction } from '../instance'

function GiflangPrint(print: (str: string) => void): TWrappedFunction {
  return (interpreter: CodeExecuter, args: Instance[]): Instance => {
    print(args
      .map(
        (arg) =>
          (arg.callMagicMethod('__str__', [arg], interpreter) as StringInstance)
            .value
      )
      .join(' '))
    return NoneInstance.getInstance()
  }
}

export { GiflangPrint }

