import { parser } from './giflang.jison'
import * as AstNodes from './ast-nodes'
import { ExecState } from './exec-state'

parser.yy = AstNodes

const res: AstNodes.ProgramNode = parser.parse(`
Y; ASSIGN; X; ASSIGN; 5;1;DOT;2; SEMICOLON;
Z; ASSIGN; X; PLUS; Y; SEMICOLON;
`)

const state = new ExecState()
res.evaluate(state)

// const res = parser.parse('MINUS; MINUS; 3; PLUS; 8; SEMICOLON;');

console.log(res)
