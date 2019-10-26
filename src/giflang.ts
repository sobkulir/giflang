import { Interpreter } from './interpreter'
import { ParseGiflang } from './parser'

const interpreter = new Interpreter((str) => console.log(str))
const root = ParseGiflang(`
CLASS; C; LCURLY;
  FUNCTION; A; LPAR; S; RPAR; LCURLY;
    S; DOT; C;E;C;K;Y; ASSIGN; 3; SEMICOLON;
  RCURLY;
  FUNCTION; F; LPAR; S; RPAR; LCURLY;
    P;R;I;N;T; LPAR; S; DOT; C;E;C;K;Y; RPAR; SEMICOLON;
  RCURLY;
RCURLY;
P; ASSIGN; C; LPAR; RPAR; SEMICOLON;
P; DOT; A; LPAR; RPAR; SEMICOLON;
P; DOT; F; LPAR; RPAR; SEMICOLON;
`,
)
interpreter.visitProgramStmt(root)

const parkPlatz = `
J; ASSIGN; 8;9; SEMICOLON;

FUNCTION; D; LPAR; P; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; P; RPAR; SEMICOLON;
  
  IF; LPAR; P; EQ; 0; RPAR; 
  LCURLY;
    P;R;I;N;T; LPAR; P; RPAR; SEMICOLON;
    RETURN; 0; SEMICOLON;
  RCURLY;
  IF; LPAR; P; EQ; 1; RPAR;
    RETURN; 1; SEMICOLON;
  
  RETURN;
    D; LPAR; P; MINUS; 1; RPAR;
    PLUS;
    D; LPAR; P; MINUS; 2; RPAR; SEMICOLON;
RCURLY;

X; ASSIGN; D; LPAR; 3;1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; X; RPAR; SEMICOLON;`
