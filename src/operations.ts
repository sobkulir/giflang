import { Operator } from './ast/operator'
import { NumberValue, StringValue, Type, Value } from './value'

function isLessThan(left: Value, right: Value): boolean {
  if (
    (left.isNumber() && right.isNumber()) ||
    (left.isString() && right.isString())
  ) {
    return left.value < right.value
  }

  throw new Error('Relational operator used for incompatible types.')
}

// TODO: Objects.
function isEqual(left: Value, right: Value): boolean {
  if (
    (left.isNumber() && right.isNumber()) ||
    (left.isString() && right.isString()) ||
    (left.isBool() && right.isBool())
  ) {
    return left.value === right.value
  } else if (left.isNone() && right.isNone()) {
    return true
  } else {
    return false
  }
}

function isTruthy(right: Value): boolean {
  if (right.isBool()) {
    return right.value
  } else if (right.isNumber()) {
    return right.value !== 0
  } else if (right.isString()) {
    return right.value !== ''
  } else if (right.isNone()) {
    return false
  } else {
    // TODO: Array & objects.
    throw new Error('internal')
  }
}

function numbersOnlyOperation(
  left: Value,
  right: Value,
  operator: Operator,
): number {
  if (!left.isNumber() || !right.isNumber()) {
    // TODO: Add operator to the error.
    throw new Error('Operands must be two numbers.')
  }
  switch (operator) {
    case Operator.MINUS:
      return left.value - right.value
    case Operator.MUL:
      return left.value * right.value
    case Operator.DIV:
      return left.value / right.value
    case Operator.MOD:
      return left.value % right.value
    default:
      throw new Error('Internal.')
  }
}

export { numbersOnlyOperation, isEqual, isTruthy, isLessThan }
