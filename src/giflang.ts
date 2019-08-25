import { ParseGiflang } from './parser'
import { Interpreter } from './interpreter'

const interpreter = new Interpreter()

const root = ParseGiflang(
  `
J; ASSIGN; 8;9; SEMICOLON;

FUNCTION; D; LPAR; P;1; RPAR;
LCURLY;
  J; ASSIGN; 4; SEMICOLON;
  RETURN; P;1; SEMICOLON;
RCURLY;

A; ASSIGN; D; LPAR; 8; RPAR; PLUS; J; SEMICOLON;`,
)
interpreter.visitProgramStmt(root)
