class Node:
    def evaluate(self, env):
        raise Exception('Method not implemented')

class Expression(Node):
    def __init__(self, left, right, op):
        self.left, self.right, self.op = left, right, op

    def evaluate(self, env):
        lval, rval = self.left.evaluate(env), self.right.evaluate(env)
        if self.op == '+':
            return lval + rval
        elif self.op == '-':
            return lval - rval
        else:
            raise Error('Unknown operator ' + self.op)

class Number(Node):
    def __init__(self, value):
        self.value = value
    
    def evaluate(self, env):
        return self.value

class VariableAccess(Node):
    def __init__(self, identifier):
        self.identifier = identifier
    
    def evaluate(self, env):
        if self.identifier in env:
            return env[self.identifier]
        else:
            raise Error('Unknown variable name accessed ' + self.identifier)

# Expression: 2 + x - 9
exp = Expression(Number(2), Expression(VariableAccess('x'), Number(9), '-'), '+')
# Prints 3
print(exp.evaluate({'x': 10}))