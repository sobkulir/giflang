import { Interpreter } from './interpreter'
import { ParseGiflang } from './parser'

const interpreter = new Interpreter()

const root = ParseGiflang(
  `
J; ASSIGN; 8;9; SEMICOLON;

FUNCTION; D; LPAR; P;1; RPAR;
LCURLY;
  J; ASSIGN; 4; SEMICOLON;
  RETURN; P;1; SEMICOLON;
RCURLY;

A; ASSIGN; 8; PLUS; 8; SEMICOLON;
P;R;I;N;T; LPAR; A; COMMA; A; RPAR; SEMICOLON;`,
)
interpreter.visitProgramStmt(root)
