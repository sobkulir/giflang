export {
    Operator,
    UIntNode,
    FloatNode,
    StringNode,
    NullNode,
    IdNode,
    UnaryExprNode,
    BinaryExprNode,
    ElementListNode,
    FunctionCallNode,
    ArrayNode,
    SquareAccessorNode,
    DotAccessorNode,
    BlockNode,
    AssignmentNode,
    EmptyStatementNode,
    IfNode,
    WhileNode,
    ForNode,
    ParameterListNode,
    FunctionDeclNode,
    ClassBodyNode,
    ClassDeclNode,
    ReturnNode,
    BreakNode,
    ContinueNode,
    ProgramNode
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

class ListNode<T> extends Node {
    elements : T[];

    constructor() {
        super();
        this.elements = [];
    }
}

type TBody = Node[];

class UIntNode extends Node {
    readonly value : Number;
    constructor(readonly rawValue : string) {
        super();
        this.value = Number(rawValue);
    }
}

class FloatNode extends Node {
    readonly value : Number;
    constructor(readonly rawValue : string) {
        super();
        this.value = Number(rawValue);
    }
}

class StringNode extends Node {
    readonly value : string;
    constructor(readonly rawValue : string) {
        super();

        // TODO: Account for escaping.
        this.value = rawValue;
    }
}

class NullNode extends Node {
    constructor() {
        super();
    }
}

class IdNode extends Node {
    constructor(readonly name : string) {
        super();
    }
}

class UnaryExprNode extends Node {
    constructor(readonly operator : Operator, readonly operand : Node) {
        super();
    }
}

class BinaryExprNode extends Node{
    constructor(
        readonly operator : Operator,
        readonly left : Node,
        readonly right : Node) {
        super();
    }
}

class ElementListNode extends ListNode<Node> {}

class FunctionCallNode extends Node {
    args : Node[];
    constructor(
        readonly callee : Node,
        elementList : ElementListNode
    ) {
        super();
        this.args = elementList.elements;
    }
}

class ArrayNode extends Node {
    elements : Node[];

    constructor(elementList : ElementListNode) {
        super();
        this.elements = elementList.elements;
    }
}

class SquareAccessorNode extends Node {
    constructor(
        readonly object : Node,
        readonly property : Node
    ) {
        super();
    }
}

class DotAccessorNode extends Node {
    constructor(
        readonly object : Node,
        readonly property : IdNode
    ) {
        super();
    }
}

class BlockNode extends Node {
    body : TBody;
    constructor(statements : ElementListNode) {
        super();
        this.body = statements.elements;
    }
}

class AssignmentNode extends Node {
    constructor(
        readonly lhs : Node,
        readonly rhs : Node
    ) {
        super();
    }
}

class EmptyStatementNode extends Node { }

class IfNode extends Node {
    constructor(
        readonly expr : Node,
        readonly consequent : Node,
        readonly alternate : (Node | null)
    ) {
        super();
    }
}

class WhileNode extends Node {
    constructor(
        readonly condition : Node,
        readonly body : Node
    ) {
        super();
    }
}

class ForNode extends Node {
    preamble : Node[]
    increments : Node[]
    constructor(
        preamble : ElementListNode,
        readonly condition : (Node | null),
        increments : ElementListNode,
        readonly body : Node
    ) {
        super();
        this.preamble = preamble.elements;
        this.increments = increments.elements;
    }
}

class ParameterListNode extends ListNode<IdNode> {};

class FunctionDeclNode extends Node {
    parameters : IdNode[];
    constructor(
        readonly name : IdNode,
        parametersNode : ParameterListNode,
        readonly body : BlockNode
    ) {
        super();
        this.parameters = parametersNode.elements;
    }
}

class ClassBodyNode extends ListNode<(AssignmentNode|FunctionDeclNode)> {};

class ClassDeclNode extends Node {
    constructor(
        readonly name : IdNode,
        readonly body : ClassBodyNode
    ) {
        super();
    }
}

class ReturnNode extends Node {
    constructor(
        readonly value : (Node | null)
    ) {
        super();
    }
}

class BreakNode extends Node {
    constructor() {
        super();
    }
}

class ContinueNode extends Node {
    constructor() {
        super();
    }
}

class ProgramNode extends Node {
    body : TBody;
    constructor() {
        super();
        this.body = [];
    }
}