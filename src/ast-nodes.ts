export {
    UnaryExpression,
    BinaryExpression,
    Identifier,
    UIntLiteral,
    FloatLiteral,
    StringLiteral,
    NullLiteral,
    Operator
};

 enum Operator {
    PLUS = '+',
    MINUS = '-',
    MUL = '*',
    DIV = '/',
    MOD = '%',
    OR  = '||',
    AND = '&&',
    NOT = '!',
    LT = '<',
    LE = '<=',
    EQ = '==',
    NE = '!=',
    GE = '>=',
    GT = '>'
}

abstract class Node {

}

abstract class Expression extends Node { }

class UnaryExpression extends Expression {
    constructor(readonly operator : Operator, readonly operand : Expression) { 
        super();
    }
}

class BinaryExpression extends Expression {
    constructor(
        readonly operator : Operator,
        readonly left : Expression,
        readonly right : Expression) {
        super();
    }
}

class Identifier extends Node {
    constructor(readonly name : string) {
        super();
    }
}

abstract class Literal extends Node { }

class UIntLiteral extends Literal {
    readonly value : Number;
    constructor(readonly rawValue : string) {
        super();
        this.value = Number(rawValue);
    }
}

class FloatLiteral extends Literal {
    readonly value : Number;
    constructor(readonly rawValue : string) {
        super();
        this.value = Number(rawValue);
    }
}

class StringLiteral extends Literal {
    readonly value : string;
    constructor(readonly rawValue : string) {
        super();

        // TODO: Account for escaping.
        this.value = rawValue;
    }
}

class NullLiteral extends Literal {
    constructor() {
        super();
    }
}