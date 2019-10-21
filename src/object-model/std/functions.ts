import { CodeExecuter } from '../../code-executer'
import { Instance, NoneInstance, StringInstance } from '../instance'

function GiflangPrint(interpreter: CodeExecuter, args: Instance[]): Instance {
  console.log(
    args
      .map(
        (arg) =>
          (arg.callMagicMethod('__str__', [arg], interpreter) as StringInstance)
            .value
      )
      .join(' ')
  )
  return NoneInstance.getInstance()
}

export { GiflangPrint }

