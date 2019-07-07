import { ExecState, ValueReference } from './exec-state'
import {
  BoolValue,
  FloatValue,
  IntValue,
  NullValue,
  StringValue,
  Type,
  Value
} from './value'
import * as Operations from './operations'

enum Operator {
  PLUS = '+',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  MOD = '%',
  OR = '||',
  AND = '&&',
  NOT = '!',
  LT = '<',
  LE = '<=',
  EQ = '==',
  NE = '!=',
  GE = '>=',
  GT = '>',
}

abstract class Node {
  abstract evaluate(state: ExecState): Value
  evaluateReference(state: ExecState): ValueReference {
    throw Error(`evaluateReference not supported on ${typeof this}`)
  }
}

abstract class ListNode<T> {
  elements: T[]

  constructor() {
    this.elements = []
  }
}

type TBody = Node[]

class UIntNode extends Node {
  readonly value: number
  constructor(readonly rawValue: string) {
    super()
    this.value = Number(rawValue)
  }

  evaluate(state: ExecState): Value {
    return new IntValue(this.value)
  }

  evaluateRef(state: ExecState): Value {
    return new IntValue(this.value)
  }
}

class FloatNode extends Node {
  readonly value: number
  constructor(readonly rawValue: string) {
    super()
    this.value = Number(rawValue)
  }

  evaluate(state: ExecState): Value {
    return new FloatValue(this.value)
  }
}

class StringNode extends Node {
  readonly value: string
  constructor(readonly rawValue: string) {
    super()

    // TODO: Account for escaping.
    this.value = rawValue
  }

  evaluate(state: ExecState): Value {
    return new StringValue(this.value.slice())
  }
}

class NullNode extends Node {
  constructor() {
    super()
  }

  evaluate(state: ExecState): Value {
    return new NullValue()
  }
}

class ResolveNode extends Node {
  constructor(readonly name: string) {
    super()
  }

  evaluate(state: ExecState): Value {
    return this.evaluateReference(state).value()
  }

  evaluateReference(state: ExecState): ValueReference {
    return state.getRef(this.name)
  }
}

class UnaryPlusMinusNode extends Node {
  constructor(readonly operator: Operator, readonly expr: Node) {
    super()
  }

  // TODO: This is soo wrong, rewrite!
  evaluate(state: ExecState): Value {
    const v: Value = this.expr.evaluate(state)

    if (this.operator === Operator.PLUS) {
      return v
    }

    if (v.type === Type.Int) {
      return new IntValue(-(v as IntValue).value)
    } else if (v.type === Type.Float) {
      return new FloatValue(-(v as FloatValue).value)
    } else {
      // TODO: Error
      throw new Error('Unary sign in front of non-numeric.')
    }
  }
}

class LogigalNotNode extends Node {
  constructor(readonly expr: Node) {
    super()
  }

  evaluate(state: ExecState): Value {
    const v: Value = this.expr.evaluate(state)
    if (v.type === Type.Bool) {
      return new BoolValue(!(v as BoolValue))
    } else {
      throw new Error('Logical not used on non-bool value.')
    }
  }
}

class AddNode extends Node {
  constructor(
    readonly operator: Operator,
    readonly left: Node,
    readonly right: Node,
  ) {
    super()
  }

  evaluate(state: ExecState): Value {
    const lop = this.left.evaluate(state)
    const rop = this.right.evaluate(state)
    return Operations.add(lop, rop, this.operator)
  }
}

class MultiplicationNode extends Node {
  constructor(
    readonly operator: Operator,
    readonly left: Node,
    readonly right: Node,
  ) {
    super()
  }

  evaluate(state: ExecState): Value {
    const lop = this.left.evaluate(state)
    const rop = this.right.evaluate(state)
    return Operations.multiplicate(lop, rop, this.operator)
  }
}

class RelationalNode extends Node {
  constructor(
    readonly operator: Operator,
    readonly left: Node,
    readonly right: Node,
  ) {
    super()
  }

  // TODO: Simplify
  evaluate(state: ExecState): Value {
    const lop = this.left.evaluate(state)
    const rop = this.right.evaluate(state)
    let ans: boolean | undefined
    let tmpRes: boolean | undefined

    switch (this.operator) {
      case Operator.LT:
      case Operator.GE:
        tmpRes = Operations.isLessThan(lop, rop)
        if (tmpRes === undefined) {
          throw new Error(
            `Relational operator ${this.operator} used with bad types: ${lop.type} ${rop.type}`,
          )
        } else {
          ans = this.operator === Operator.LT ? tmpRes : !tmpRes
        }
        break
      case Operator.GT:
      case Operator.LE:
        tmpRes = Operations.isLessThan(rop, lop)
        if (tmpRes === undefined) {
          throw new Error(
            `Relational operator ${this.operator} used with bad types: ${lop.type} ${rop.type}`,
          )
        } else {
          ans = this.operator === Operator.GT ? tmpRes : !tmpRes
        }
        break
      default:
      // TODO: Unreachable code
    }

    // TODO: yeah, simplify!
    if (ans === undefined) throw Error()
    else return new BoolValue(ans)
  }
}

class EqualNode extends Node {
  constructor(
    readonly operator: Operator,
    readonly left: Node,
    readonly right: Node,
  ) {
    super()
  }

  // TODO: Implement.
  evaluate(state: ExecState): Value {
    throw Error('Not implemented.')
  }
}

class BinaryLogicalNode extends Node {
  constructor(
    readonly operator: Operator,
    readonly left: Node,
    readonly right: Node,
  ) {
    super()
  }

  evaluate(state: ExecState): Value {
    const lop = this.left.evaluate(state)
    let ans: boolean | undefined

    if (lop.isBool()) {
      if (this.operator === Operator.OR) {
        if (lop.value === true) {
          ans = true
        } else {
          const rop = this.right.evaluate(state)
          if (rop.isBool()) ans = rop.value
        }
      } else if (this.operator === Operator.AND) {
        const rop = this.right.evaluate(state)
        if (rop.isBool()) ans = lop.value && rop.value
      } else {
        // TODO: Throw Internal, unreachable code
        throw Error()
      }
    }

    // TODO: Better desc.
    if (ans === undefined) throw Error('Invalid types')
    else return new BoolValue(ans)
  }
}

class ElementListNode extends ListNode<Node> {}

class FunctionCallNode extends Node {
  args: Node[]
  constructor(readonly callee: Node, elementList: ElementListNode) {
    super()
    this.args = elementList.elements
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class ArrayNode extends Node {
  elements: Node[]

  constructor(elementList: ElementListNode) {
    super()
    this.elements = elementList.elements
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class SquareAccessorNode extends Node {
  constructor(readonly object: Node, readonly property: Node) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class DotAccessorNode extends Node {
  constructor(readonly object: Node, readonly property: string) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class BlockNode extends Node {
  body: TBody
  constructor(statements: ElementListNode) {
    super()
    this.body = statements.elements
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class AssignmentNode extends Node {
  constructor(readonly lhs: Node, readonly rhs: Node) {
    super()
  }

  evaluate(state: ExecState): Value {
    const lval = this.lhs.evaluateReference(state)
    const rval = this.rhs.evaluate(state)
    lval.set(rval)
    return rval
  }
}

class EmptyStatementNode extends Node {
  evaluate(state: ExecState): Value {
    return new NullValue()
  }
}

class IfNode extends Node {
  constructor(
    readonly expr: Node,
    readonly consequent: Node,
    readonly alternate: Node | null,
  ) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class WhileNode extends Node {
  constructor(readonly condition: Node, readonly body: Node) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class ForNode extends Node {
  preamble: Node[]
  increments: Node[]
  constructor(
    preamble: ElementListNode,
    readonly condition: Node | null,
    increments: ElementListNode,
    readonly body: Node,
  ) {
    super()
    this.preamble = preamble.elements
    this.increments = increments.elements
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class FunctionDeclNode extends Node {
  constructor(
    readonly name: string,
    readonly parameters: string[],
    readonly body: BlockNode,
  ) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class ClassBodyNode extends ListNode<AssignmentNode | FunctionDeclNode> {}

class ClassDeclNode extends Node {
  constructor(readonly name: string, readonly body: ClassBodyNode) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class ReturnNode extends Node {
  constructor(readonly value: Node | null) {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class BreakNode extends Node {
  constructor() {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class ContinueNode extends Node {
  constructor() {
    super()
  }

  evaluate(state: ExecState): Value {
    throw Error('Not implemented')
  }
}

class ProgramNode extends Node {
  body: TBody
  constructor() {
    super()
    this.body = []
  }

  evaluate(state: ExecState): Value {
    for (const s of this.body) console.log(s.evaluate(state))

    return new NullValue()
  }
}

export {
  Operator,
  UIntNode,
  FloatNode,
  StringNode,
  NullNode,
  ResolveNode,
  UnaryPlusMinusNode,
  LogigalNotNode,
  RelationalNode,
  AddNode,
  MultiplicationNode,
  ElementListNode,
  FunctionCallNode,
  ArrayNode,
  EqualNode,
  SquareAccessorNode,
  DotAccessorNode,
  BlockNode,
  AssignmentNode,
  EmptyStatementNode,
  BinaryLogicalNode,
  IfNode,
  WhileNode,
  ForNode,
  FunctionDeclNode,
  ClassBodyNode,
  ClassDeclNode,
  ReturnNode,
  BreakNode,
  ContinueNode,
  ProgramNode,
  Node
}
