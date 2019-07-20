import { Operator } from './ast-nodes'
import { FloatValue, IntValue, StringValue, Type, Value } from './value'
import { assertUnreachable } from './utils'

export function add(left: Value, right: Value, operator: Operator): Value {
  if (left.isString() && right.isString() && operator === Operator.PLUS) {
    return new StringValue(left.value + right.value)
  } else if (left.isInt() && right.isInt()) {
    if (operator === Operator.PLUS) {
      return new IntValue(left.value + right.value)
    } else {
      return new IntValue(left.value - right.value)
    }
  } else if (
    (left.isInt() || left.isFloat()) &&
    (right.isInt() || right.isFloat())
  ) {
    if (operator === Operator.PLUS) {
      return new FloatValue(left.value + right.value)
    } else {
      return new FloatValue(left.value - right.value)
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
  if (left.isInt() && right.isInt()) {
    switch (operator) {
      case Operator.MUL:
        return new IntValue(left.value + right.value)
      case Operator.DIV:
        return new IntValue(Math.floor(left.value / right.value))
      case Operator.MOD:
        return new IntValue(left.value % right.value)
      default:
        return assertUnreachable(`Got operator: ${operator}`)
    }
  } else if (
    (left.isInt() || left.isFloat()) &&
    (right.isInt() || right.isFloat())
  ) {
    switch (operator) {
      case Operator.MUL:
        return new FloatValue(left.value + right.value)
      case Operator.DIV:
        return new FloatValue(left.value / right.value)
      case Operator.MOD:
        return new FloatValue(left.value % right.value)
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
    ((left.isInt() || left.isFloat()) && (right.isInt() || right.isFloat())) ||
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
    (left.isInt() && right.isInt()) ||
    (left.isString() && right.isString()) ||
    (left.isBool() && right.isBool())
  ) {
    return left.value === right.value
  } else if (
    (left.isInt() || left.isFloat()) &&
    (right.isInt() || right.isFloat())
  ) {
    // TODO: Cast to float once proper ints/floats are used.
    return left.value === right.value
  } else if (left.isNull() && right.isNull()) {
    return true
  } else {
    return undefined
  }
}
