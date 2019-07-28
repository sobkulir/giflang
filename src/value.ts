const enum Type {
  Null,
  Bool,
  String,
  Int,
  Float,
  Object,
}

abstract class Value {
  constructor(readonly type: Type) {}

  isString(): this is StringValue {
    return this instanceof StringValue
  }

  isNumber(): this is NumberValue {
    return this instanceof NumberValue
  }

  isBool(): this is BoolValue {
    return this instanceof BoolValue
  }

  isNone(): this is NoneValue {
    return this instanceof NoneValue
  }
}

class NumberValue extends Value {
  constructor(readonly value: number) {
    super(Type.Int)
  }
}

class StringValue extends Value {
  constructor(readonly value: string) {
    super(Type.String)
  }
}

class BoolValue extends Value {
  constructor(readonly value: boolean) {
    super(Type.Bool)
  }
}

class NoneValue extends Value {
  constructor() {
    super(Type.Null)
  }
}

export { Type, Value, NumberValue, BoolValue, StringValue, NoneValue }
