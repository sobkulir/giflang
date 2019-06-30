import { parser } from './giflang.jison';
import * as AstNodes from './ast-nodes';

parser.yy = AstNodes;

const res = parser.parse(`
IF; LPAR; 3; RPAR; 3; PLUS; 4; SEMICOLON; ELSE; 3; SEMICOLON; 
G; ASSIGN; NOT; 5; PLUS; 3; SEMICOLON;
FUNCTION; J;A;N;O; LPAR; C;E;C; COMMA; K;Y; RPAR; LCURLY;
    5; PLUS; 3; SEMICOLON;
RCURLY;
WHILE; LPAR; K;O;K; GT; P;I;C;A;V;O;D;A;1; RPAR;
    X; ASSIGN; 3; PLUS; X; SEMICOLON;

FOR; LPAR; 
        X; ASSIGN; 2; COMMA; Y; ASSIGN; 4; SEMICOLON;
        X; LT; 3; SEMICOLON;
        Y; ASSIGN; 3; COMMA; 3; PLUS; 2; RPAR;
    D;A;C;O; SEMICOLON;

CLASS; E;C;H; LCURLY;
    X; ASSIGN; 3; SEMICOLON;
    Y; ASSIGN; Z; ASSIGN; 8; SEMICOLON;
    FUNCTION; D;A;C;O; LPAR; H; RPAR; LCURLY; RCURLY;
RCURLY;
`);
// const res = parser.parse('MINUS; MINUS; 3; PLUS; 8; SEMICOLON;');

console.log(res);