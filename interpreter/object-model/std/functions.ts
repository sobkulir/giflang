import { CodeExecuter } from '../../code-executer'
import { StringClass } from '../class'
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
  const regexp = new RegExp('^[A-Z0-9 ]*$')
  return async (_interpreter: CodeExecuter, args: Instance[])
    : Promise<StringInstance> => {
    const line = await input()
    if (!regexp.test(line)) {
      throw new Error('TODO: Input can only contain uppercase \
letters, digits and spaces "^[A-Z0-9 ]*$"')
    }
    return new StringInstance(StringClass.get(), line)
  }
}
