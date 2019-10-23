import { Interpreter } from './interpreter'
import { ParseGiflang } from './parser'

const interpreter = new Interpreter((str) => console.log(str))
const root = ParseGiflang(`
J; ASSIGN; 8;9; SEMICOLON;

FUNCTION; D; LPAR; P; RPAR;
LCURLY;  
  IF; LPAR; P; EQ; 0; RPAR; 
  LCURLY;
    RETURN; 0; SEMICOLON;
  RCURLY;
  IF; LPAR; P; EQ; 1; RPAR;
    RETURN; 1; SEMICOLON;
  
  RETURN;
    D; LPAR; P; MINUS; 1; RPAR;
    PLUS;
    D; LPAR; P; MINUS; 2; RPAR; SEMICOLON;
RCURLY;

I; ASSIGN; 0; SEMICOLON;
WHILE;
  LPAR;
    I; LT; 1;5;
  RPAR; LCURLY;
    P;R;I;N;T; LPAR; I; COMMA; D; LPAR; I; RPAR;  RPAR; SEMICOLON;
    I; ASSIGN; I; PLUS; 1; SEMICOLON;
  RCURLY;`,
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
