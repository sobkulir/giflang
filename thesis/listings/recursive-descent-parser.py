idx = 0
states = ['NUMBER', 'OPERATOR', 'NUMBER', '-1']

def curToken():
    return states[idx]

def nextToken():
    global idx
    idx = idx + 1

def accept(token):
    if curToken() == token:
        nextToken()
        return 1
    return 0

def expect(token):
    if accept(token):
        return 1
    raise Exception("expect: unexpected token")

def factor():
    if accept('IDENTIFIER'):
        # Action
        pass
    elif accept('NUMBER'):
        # Action
        pass 
    else:
        raise Exception("factor: syntax error")

def expression():
    factor()
    if accept('OPERATOR'):
        expression()
        # Action

expression()