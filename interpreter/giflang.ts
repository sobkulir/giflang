import { Interpreter } from './interpreter'
import { ParseGiflang } from './parser'

const interpreter = new Interpreter(
  {
    onPrint: (str) => console.log(str),
    onNextStep: async () => { return },
    onInput: () => '',
  })
const root = ParseGiflang(`
# coment
x;
`,
)
try {
  interpreter.visitProgramStmt(root)
} finally {
  console.log(interpreter.callStack)
}

const parkPlatz = `
CLASS; C; LCURLY; 
  FUNCTION; _;_;C;A;L;L;_;_; LPAR; S; RPAR; LCURLY;
    P;R;I;N;T; LPAR; QUOTE; X; QUOTE; RPAR; SEMICOLON;
  RCURLY;

  FUNCTION; A; LPAR; S; RPAR; LCURLY;
    S; PROP; C;E;C;K;Y; ASSIGN; 3; SEMICOLON;
  RCURLY;
  FUNCTION; F; LPAR; S; RPAR; LCURLY;
    P;R;I;N;T; LPAR; S; PROP; C;E;C;K;Y; RPAR; SEMICOLON;
  RCURLY;
RCURLY;

CLASS; D; LPAR; C; RPAR; LCURLY;
  FUNCTION; _;_;C;A;L;L;_;_; LPAR; S; RPAR; LCURLY;
    P;R;I;N;T; LPAR; S; PROP; C;E;C;K;Y; MUL; S; 
      PROP; C;E;C;K;Y; RPAR; SEMICOLON;
  RCURLY;
  FUNCTION; F; LPAR; S; RPAR; LCURLY;
    P;R;I;N;T; LPAR; S; PROP; C;E;C;K;Y; PLUS; 1; RPAR; SEMICOLON;
  RCURLY;
RCURLY;

P; ASSIGN; D; LPAR; RPAR; SEMICOLON;
D; PROP; A; PROP; _;_;C;A;L;L;_;_; PROP; _;_;C;A;L;L;_;_; LPAR; P; RPAR; SEMICOLON;
P; PROP; F; LPAR; RPAR; SEMICOLON;
P; LPAR; RPAR; SEMICOLON;
LPAR; C; LPAR; RPAR; RPAR; ASSIGN; 3; SEMICOLON;
LPAR; C; LPAR; RPAR; RPAR; LPAR; RPAR; SEMICOLON;
`
