import { Operator } from './operator'
import { NumberValue, StringValue, Type, Value } from './value'
import { assertUnreachable } from './utils'

export function add(left: Value, right: Value, operator: Operator): Value {
  if (left.isString() && right.isString() && operator === Operator.PLUS) {
    return new StringValue(left.value + right.value)
  } else if (left.isNumber() && right.isNumber()) {
    if (operator === Operator.PLUS) {
      return new NumberValue(left.value + right.value)
    } else {
      return new NumberValue(left.value - right.value)
    }
  } else {
    throw new Error(
      'Unsopported operation ' +
        operator +
        ' on types ' +
        left.type +
        ' ' +
        right.type,
    )
  }
}

export function multiplicate(
  left: Value,
  right: Value,
  operator: Operator,
): Value {
  if (left.isNumber() && right.isNumber()) {
    switch (operator) {
      case Operator.MUL:
        return new NumberValue(left.value + right.value)
      case Operator.DIV:
        return new NumberValue(Math.floor(left.value / right.value))
      case Operator.MOD:
        return new NumberValue(left.value % right.value)
      default:
        return assertUnreachable(`Got operator: ${operator}`)
    }
  } else {
    throw new Error(
      'Unsopported operation ' +
        operator +
        ' on types ' +
        left.type +
        ' ' +
        right.type,
    )
  }
}

export function isLessThan(left: Value, right: Value): boolean | undefined {
  if (
    (left.isNumber() && right.isNumber()) ||
    (left.isString() && right.isString())
  ) {
    return left.value < right.value
  } else {
    return undefined
  }
}

// TODO: Implement with references.
export function equals(left: Value, right: Value): boolean | undefined {
  if (
    (left.isNumber() && right.isNumber()) ||
    (left.isString() && right.isString()) ||
    (left.isBool() && right.isBool())
  ) {
    return left.value === right.value
  } else if (left.isNone() && right.isNone()) {
    return true
  } else {
    return undefined
  }
}
