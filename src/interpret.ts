import { parser } from './giflang.jison';
import * as AstNodes from './ast-nodes';

parser.yy = AstNodes;
console.log(parser);
const res = parser.parse(`
J; A; ASSIGN; 3; SEMICOLON; SEMICOLON;
J; A; ASSIGN; 3; SEMICOLON; SEMICOLON;
FUNCTION; D; LPAR; H; A; COMMA; M; RPAR; LCURLY; RETURN; 3; SEMICOLON; RCURLY;
`);
// const res = parser.parse('MINUS; MINUS; 3; PLUS; 8; SEMICOLON;');

console.log(res);