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

  isInt(): this is IntValue {
    return this instanceof IntValue
  }

  isFloat(): this is FloatValue {
    return this instanceof FloatValue
  }

  isBool(): this is BoolValue {
    return this instanceof BoolValue
  }

  isNull(): this is NullValue {
    return this instanceof NullValue
  }
}

class IntValue extends Value {
  constructor(readonly value: number) {
    super(Type.Int)
  }
}

class FloatValue extends Value {
  constructor(readonly value: number) {
    super(Type.Float)
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

class NullValue extends Value {
  constructor() {
    super(Type.Null)
  }
}

export { Type, Value, IntValue, FloatValue, BoolValue, StringValue, NullValue }
