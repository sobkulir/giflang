import { ParseGiflang } from './parser'

function should_fail(program: any) {
  let didFail: boolean = true
  try {
    ParseGiflang(program)
  } catch {
    didFail = false
  } finally {
    console.log(didFail ? 'FAIL' : 'OK')
  }
}

function should_pass(program: any) {
  ParseGiflang(program)
  console.log('OK')
}

function test(programs: any) {
  for (const program of programs) {
    if (typeof program === 'string') {
      should_pass(program)
    } else {
      should_fail(program)
    }
  }
}

test([
  /* Functions */
  /* Definition */
  `FUNCTION; D; LPAR; P;1; COMMA; P;2; RPAR;
LCURLY; RETURN; 3; SEMICOLON; RCURLY;`,
  /* Function in function. */
  `FUNCTION; F;1; LPAR; RPAR; LCURLY;
    FUNCTION; F;2; LPAR; RPAR; LCURLY; RCURLY;
RCURLY;`,
  /* Call */
  `F;U;N;C; LPAR; A;R;G; RPAR; SEMICOLON;`,
  /* Assignment to function call should fail. */
  [`F;U;N;C; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`],
  /* Assignment to accesed function call should fail. */
  [`A;R;R; LBRA; 0; RBRA; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`],
  /* Assignment to a member. */
  `F;U;N;C; LPAR; A;R;G; RPAR; LBRA; 0; RBRA; ASSIGN; 5; SEMICOLON;`,
  `F;U;N;C; LPAR; A;R;G; RPAR; DOT; P;R;O;P; ASSIGN; 5; SEMICOLON;`,
  /* Lambdas are not supported yet. */
  [`J; ASSIGN; FUNCTION; LPAR; RPAR; LCURLY; RCURLY; SEMICOLON;`],

  /* Arrays */
  /* Literal */
  `LBRA; 1;2; COMMA; 4;2; RBRA; SEMICOLON;`,
  /* Empty */
  `LBRA; RBRA; SEMICOLON;`,
  /* Assignment to an element. */
  `LBRA; 1;2; COMMA; 4;2; RBRA; LBRA; 0; RBRA; ASSIGN; 1; SEMICOLON;`,
  /* Assignment to calling an array literal should fail. */
  [`LBRA; 1; COMMA; 2; RBRA; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`],

  /* Assignment */
  /* Multiassignment */
  `A; ASSIGN; B; ASSIGN; 0; SEMICOLON;`,

  /* Classes */
  `CLASS; C; LCURLY;
    X; ASSIGN; 3; SEMICOLON;
    FUNCTION; M;E;T;H;O;D; LPAR; RPAR; LCURLY; RCURLY;
RCURLY;`,

  /* Expressions */
  `NOT; PLUS; MINUS; 5; SEMICOLON;`,
])
