class Node:
    def accept(self, visitor):
        raise Exception('Method not implemented')

class Expression(Node):
    def __init__(self, left, right, op):
        self.left, self.right, self.op = left, right, op

    def accept(self, visitor):
        return visitor.visitExpression(self)

class Number(Node):
    def __init__(self, value):
        self.value = value
    
    def accept(self, visitor):
        return visitor.visitNumber(self)

class VariableAccess(Node):
    def __init__(self, identifier):
        self.identifier = identifier
    
    def accept(self, visitor):
        return visitor.visitVariableAccess(self)

class Interpreter:
    def __init__(self, env):
        self.env = env
    
    def visitExpression(self, exprNode):
        lval, rval = exprNode.left.accept(self), exprNode.right.accept(self)
        if exprNode.op == '+':
            return lval + rval
        elif exprNode.op == '-':
            return lval - rval
        else:
            raise Error('Unknown operator ' + exprNode.op)
    
    def visitNumber(self, numberNode):
        return numberNode.value
    
    def visitVariableAccess(self, variableAccessNode):
        id = variableAccessNode.identifier
        if id in self.env:
            return self.env[id]
        else:
            raise Error('Unknown variable ' + id)

# Expression: 2 + x - 9
exp = Expression(Number(2), Expression(VariableAccess('x'), Number(9), '-'), '+')
interpreter = Interpreter({'x': 10})
# Prints 3
print(exp.accept(interpreter))