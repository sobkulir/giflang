import { ProgramStmt } from './ast/stmt'
import { Interpreter } from './interpreter'
import { ParseGiflang } from './parser'

enum ExpectedResult { FAIL_PARSE, PASS_PARSE, FAIL_RUNTIME, MATCH_OUTPUT }
type Test = {
  name: string,
  source: string,
  expected: ExpectedResult,
  output?: string,
}

type TestSuite = {
  name: string,
  tests?: Test[],
  suites?: TestSuite[]
  ,
}

function testSingle(test: Test): { didPass: boolean, desc: string } {
  let didPass: boolean | null = null
  let desc: string = ''

  let parseFailed: boolean = false
  // The default value PraseGiflang('') here is used to silence
  // an unreasonable TS warning about "program" being unassigned.
  // Issue: https://github.com/Microsoft/TypeScript/issues/12916
  let program: ProgramStmt = ParseGiflang('')
  try {
    program = ParseGiflang(test.source)
  } catch (e) {
    parseFailed = true
    desc = e
  }

  // FAIL_PARSE
  if (test.expected === ExpectedResult.FAIL_PARSE) {
    if (parseFailed) {
      didPass = true
    } else {
      didPass = false
      desc = 'Parsing succeed (failure was expected)'
    }
  } else if (test.expected === ExpectedResult.PASS_PARSE) {
    // PASS_PARSE
    if (!parseFailed) {
      didPass = true
    } else {
      didPass = false
    }
  } else {
    if (parseFailed) {
      didPass = false
      desc =
        `Expected ${ExpectedResult[test.expected]},\
 got ${nameof(ExpectedResult.FAIL_PARSE)}`
    }
  }

  if (didPass !== null) return { didPass, desc }

  // FAIL_RUNTIME
  const outputs: string[] = []
  const interpreter = new Interpreter((str) => outputs.push(str))
  try {
    interpreter.visitProgramStmt(program)
  } catch (e) {
    if (test.expected === ExpectedResult.FAIL_RUNTIME) {
      didPass = true
    } else {
      didPass = false
      desc = e
    }
  }

  if (didPass !== null) return { didPass, desc }

  // MATCH_OUTPUT
  const actualOutput = outputs.join('\n')
  if (!test.output || test.output === actualOutput) {
    didPass = true
  } else {
    didPass = false
    desc = `Expected: "${test.output}"\nActual: "${actualOutput}"`
  }

  return { didPass, desc }
}

function testSuites(suites: TestSuite[], level: number = 0)
  : { passCount: number, failCount: number } {
  let passCount = 0
  let failCount = 0
  for (const suite of suites) {
    console.log(`${' '.repeat(2 * level)} > ${suite.name}`)
    if (suite.suites) {
      const curResults = testSuites(suite.suites, level + 1)
      passCount += curResults.passCount
      failCount += curResults.failCount
    }
    if (suite.tests) {
      for (const test of suite.tests) {
        const { didPass, desc } = testSingle(test)
        console.log(
          `${' '.repeat(2 * (level + 1))} ${didPass ? 'o' : 'x'} ${test.name}`)
        if (!didPass) console.log(desc)
        if (didPass)++passCount
        else ++failCount
      }
    }
  }
  return { passCount, failCount }
}

const parser =
{
  name: 'Parser',
  suites: [
    {
      name: 'Function',
      suites: [
        {
          name: 'Definition',
          tests: [
            {
              name: 'Single definition w/o arguments',
              source: `
FUNCTION; F; LPAR; RPAR; LCURLY;
  RETURN; 3; SEMICOLON;
RCURLY;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Nested functions',
              source: `
FUNCTION; F;1; LPAR; RPAR; LCURLY;
  FUNCTION; F;2; LPAR; RPAR; LCURLY; RCURLY;
RCURLY;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Name starting with a number',
              source: `
FUNCTION; 1;N; LPAR; RPAR; LCURLY; RCURLY;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Multiple parameters',
              source: `
FUNCTION; F; LPAR; P;1; COMMA; P;2; RPAR; LCURLY; RCURLY;`,
              expected: ExpectedResult.PASS_PARSE,
            },
          ]
        },
        {
          name: 'Call',
          tests: [
            {
              name: 'w/o arguments',
              source: `
F; LPAR; RPAR; SEMICOLON;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'With a single argument',
              source: `
F; LPAR; A; RPAR; SEMICOLON;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Missing parentheses',
              source: `
F; LPAR; SEMICOLON;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Missing parentheses with argument',
              source: `
F; LPAR; A; SEMICOLON;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'With multiple arguments',
              source: `
F; LPAR; A;1; COMMA; A;2; RPAR; SEMICOLON;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Invalid name of a function',
              source: `
1;A; LPAR; RPAR; SEMICOLON;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Nested function call',
              source: `
F;1; LPAR; F;2; LPAR; RPAR; RPAR; SEMICOLON;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Assignment to function call should fail',
              source: `
F;U;N;C; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Assignment to accesed function call should fail',
              source: `
A;R;R; LBRA; 0; RBRA; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Assignment to a member of a returned array value',
              source: `
F;U;N;C; LPAR; A;R;G; RPAR; LBRA; 0; RBRA; ASSIGN; 5; SEMICOLON;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Assignment to a member of a returned object value',
              source: `
F;U;N;C; LPAR; A;R;G; RPAR; PROP; P;R;O;P; ASSIGN; 5; SEMICOLON;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Defining a lambda should fail (for now)',
              source: `
J; ASSIGN; FUNCTION; LPAR; RPAR; LCURLY; RCURLY; SEMICOLON;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
          ]
        }
      ],
    },
    {
      name: 'Array',
      tests: [
        {
          name: 'Array literal',
          source: `
LBRA; 1;2; COMMA; 4;2; RBRA; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Multidimensonal array literal with values',
          source: `
            LBRA; LBRA; 1; RBRA; COMMA; 3; RBRA; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Empty array literal',
          source: `
            LBRA; RBRA; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Empty multidimensonal array literal',
          source: `
                      LBRA; LBRA; RBRA; RBRA; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Assignment to an element.',
          source: `
LBRA; 1;2; COMMA; 4;2; RBRA; LBRA; 0; RBRA; ASSIGN; 1; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Assignment',
          source: `
LBRA; 1;2; COMMA; 4;2; RBRA; LBRA; 0; RBRA; ASSIGN; 1; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Calling an array literal',
          source: `
LBRA; RBRA; LPAR; RPAR; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Assignment to calling an array literal shoudl fail',
          source: `
LBRA; RBRA; LPAR; RPAR; ASSIGN; 3; SEMICOLON;`,
          expected: ExpectedResult.FAIL_PARSE
        },
      ]
    },
    {
      name: 'Assignment',
      tests: [
        {
          name: 'Multiassignment',
          source: `
A; ASSIGN; B; ASSIGN; 0; SEMICOLON;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Dangling assign operator should fail',
          source: `
A; ASSIGN; SEMICOLON;`,
          expected: ExpectedResult.FAIL_PARSE
        }
      ]
    }
  ],
}

const runtime = {
  name: 'Language',
  suites: [
    {
      name: 'Functions',
      tests: [
        {
          name: 'Fibonacci',
          source: `
FUNCTION; F;I;B; LPAR; P; RPAR;
LCURLY;  
  IF; LPAR; P; EQ; 0; RPAR; 
  LCURLY;
    RETURN; 0; SEMICOLON;
  RCURLY;
  IF; LPAR; P; EQ; 1; RPAR;
    RETURN; 1; SEMICOLON;
  
  RETURN;
    F;I;B; LPAR; P; MINUS; 1; RPAR;
    PLUS;
    F;I;B; LPAR; P; MINUS; 2; RPAR; SEMICOLON;
RCURLY;

P;R;I;N;T; LPAR; F;I;B; LPAR; 1;0; RPAR; RPAR; SEMICOLON;
`,
          output: '55',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Returns complex object',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;  
  RETURN; 
    LBRA;
      LBRA; QUOTE; A; QUOTE; COMMA; 3; RBRA; COMMA;
      LBRA; TRUE; COMMA; FALSE; RBRA;
    RBRA; SEMICOLON;
RCURLY;

P;R;I;N;T; LPAR; F; LPAR; RPAR; RPAR; SEMICOLON;
`,
          output: '[[A, 3], [True, False]]',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Closure captures enclosing environment',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  X; ASSIGN; 0; SEMICOLON;
  FUNCTION; G; LPAR; RPAR;
  LCURLY;
    X; ASSIGN; X; PLUS; 1; SEMICOLON;
  RCURLY;
  G; LPAR; RPAR; SEMICOLON;
  G; LPAR; RPAR; SEMICOLON;
  P;R;I;N;T; LPAR; X; RPAR; SEMICOLON;
RCURLY;

F; LPAR; RPAR; SEMICOLON;
`,
          output: '2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Closure captures variables defined after it',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  FUNCTION; G; LPAR; RPAR;
  LCURLY;
    X; ASSIGN; X; PLUS; 1; SEMICOLON;
  RCURLY;
  X; ASSIGN; 0; SEMICOLON;
  G; LPAR; RPAR; SEMICOLON;
  G; LPAR; RPAR; SEMICOLON;
  P;R;I;N;T; LPAR; X; RPAR; SEMICOLON;
RCURLY;

F; LPAR; RPAR; SEMICOLON;
`,
          output: '2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '(Bug) Break statement outside for/while break execution',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  BREAK; SEMICOLON;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
RCURLY;

F; LPAR; RPAR; SEMICOLON;
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '(Bug) Continue statement outside for/while break execution',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  CONTINUE; SEMICOLON;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
RCURLY;

F; LPAR; RPAR; SEMICOLON;
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Passing callback',
          source: `
FUNCTION; F; LPAR; G; RPAR;
LCURLY;
  RETURN; G; LPAR; G; LPAR; 0; RPAR; RPAR; SEMICOLON;
RCURLY;

FUNCTION; I;N;C; LPAR; X; RPAR;
LCURLY;
  RETURN; X; PLUS; 1; SEMICOLON;
RCURLY;

P;R;I;N;T; LPAR; F; LPAR; I;N;C; RPAR; RPAR; SEMICOLON;
`,
          output: '2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Returning function works',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  I; ASSIGN; 0; SEMICOLON;
  FUNCTION; C;O;U;N;T; LPAR; RPAR;
  LCURLY;
    I; ASSIGN; I; PLUS; 1; SEMICOLON;
    P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  RCURLY;
  RETURN; C;O;U;N;T; SEMICOLON;
RCURLY;

C; ASSIGN; F; LPAR; RPAR; SEMICOLON;
C; LPAR; RPAR; SEMICOLON;
C; LPAR; RPAR; SEMICOLON;
`,
          output: '1\n2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Accessing __call__ works',
          source: `
FUNCTION; F; LPAR; X; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; X; RPAR; SEMICOLON;
RCURLY;

F; PROP; _;_;c;a;l;l;_;_; LPAR; 1; RPAR; SEMICOLON;
F; PROP; _;_;c;a;l;l;_;_; PROP; _;_;c;a;l;l;_;_; LPAR; 1; RPAR; SEMICOLON;
`,
          output: '1\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        }
      ]
    },
    {
      name: 'If',
      tests: [
        {
          name: 'Positive if',
          source: `
IF; LPAR; TRUE; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Negative if',
          source: `
IF; LPAR; FALSE; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Omitting brackets should fail',
          source: `
IF; TRUE;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
`,
          expected: ExpectedResult.FAIL_PARSE
        },
        {
          name: 'Positive if else',
          source: `
IF; LPAR; TRUE; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
ELSE;
  P;R;I;N;T; LPAR; 0; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Negative if else',
          source: `
IF; LPAR; FALSE; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
ELSE;
  P;R;I;N;T; LPAR; 0; RPAR; SEMICOLON;
`,
          output: '0',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Else if',
          source: `
X; ASSIGN; 0; SEMICOLON;
IF; LPAR; X; EQ; 0; RPAR;
  P;R;I;N;T; LPAR; 0; RPAR; SEMICOLON;
ELSE; IF; LPAR; X; EQ; 1; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
ELSE;
  P;R;I;N;T; LPAR; 2; RPAR; SEMICOLON;

X; ASSIGN; 1; SEMICOLON;
IF; LPAR; X; EQ; 0; RPAR;
  P;R;I;N;T; LPAR; 0; RPAR; SEMICOLON;
ELSE; IF; LPAR; X; EQ; 1; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
ELSE;
  P;R;I;N;T; LPAR; 2; RPAR; SEMICOLON;

X; ASSIGN; 2; SEMICOLON;
IF; LPAR; X; EQ; 0; RPAR;
  P;R;I;N;T; LPAR; 0; RPAR; SEMICOLON;
ELSE; IF; LPAR; X; EQ; 1; RPAR;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
ELSE;
  P;R;I;N;T; LPAR; 2; RPAR; SEMICOLON;
`,
          output: '0\n1\n2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
      ]
    },
    {
      name: 'While',
      tests: [
        {
          name: 'Does iterate',
          source: `
I; ASSIGN; 0; SEMICOLON;
WHILE; LPAR; I; LT; 2; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; SEMICOLON;
RCURLY;
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Continue" jumps to the next cycle',
          source: `
I; ASSIGN; 0; SEMICOLON;
WHILE; LPAR; I; LT; 2; RPAR;
LCURLY;
  I; ASSIGN; I; PLUS; 1; SEMICOLON;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  CONTINUE; SEMICOLON;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
RCURLY;
`,
          output: '1\n2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Break" jumps out of the loop',
          source: `
I; ASSIGN; 0; SEMICOLON;
WHILE; LPAR; I; LT; 3; RPAR;
LCURLY;
  IF; LPAR; I; EQ; 2; RPAR;
    BREAK; SEMICOLON;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; SEMICOLON;
RCURLY;
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Return" jumps out of the loop',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  WHILE; LPAR; TRUE; RPAR;
  LCURLY;
    RETURN; 1; SEMICOLON;
  RCURLY;
RCURLY;

P;R;I;N;T; LPAR; F; LPAR; RPAR; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Continue" affect enclosing while.',
          source: `
I; ASSIGN; 0; SEMICOLON;
WHILE; LPAR; I; LT; 2; RPAR;
LCURLY;
  J; ASSIGN; 3; SEMICOLON;
  WHILE; LPAR; J; LT; 5; RPAR;
  LCURLY;
    J; ASSIGN; J; PLUS; 1; SEMICOLON;
    CONTINUE; SEMICOLON;
    P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  RCURLY;

  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; SEMICOLON;
RCURLY;
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Break" affect enclosing while.',
          source: `
I; ASSIGN; 0; SEMICOLON;
WHILE; LPAR; I; LT; 2; RPAR;
LCURLY;
  WHILE; LPAR; TRUE; RPAR;
  LCURLY;
    BREAK; SEMICOLON;
  RCURLY;

  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; SEMICOLON;
RCURLY;
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Return" jumps out of multiple loops',
          source: `
FUNCTION; F; LPAR; RPAR;
LCURLY;
  WHILE; LPAR; TRUE; RPAR;
  LCURLY;
    WHILE; LPAR; TRUE; RPAR;
    LCURLY;
      RETURN; 1; SEMICOLON;
    RCURLY;
  RCURLY;
RCURLY;

P;R;I;N;T; LPAR; F; LPAR; RPAR; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
      ]
    },
    {
      name: 'For',
      tests: [
        {
          name: 'for(;;) works',
          source: `
X; ASSIGN; 0; SEMICOLON;
FOR; LPAR; SEMICOLON; SEMICOLON; RPAR;
LCURLY;
  X; ASSIGN; 1; SEMICOLON;
  BREAK; SEMICOLON;
RCURLY;
P;R;I;N;T; LPAR; X; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'for(i = 0; i < 2; ++i) works',
          source: `
FOR; LPAR;
  I; ASSIGN; 0; SEMICOLON;
  I; LT; 2; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
RCURLY;
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'for(i = 0, j = 4; i != j; ++i, --j) works',
          source: `
FOR; LPAR;
  I; ASSIGN; 0; COMMA; J; ASSIGN; 4; SEMICOLON;
  I; NE; J; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; COMMA; J; ASSIGN; J; MINUS; 1; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; I; COMMA; J; RPAR; SEMICOLON;
RCURLY;
`,
          output: '0 4\n1 3',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Break" jumps out of the cycle',
          source: `
FOR; LPAR;
  SEMICOLON;
  SEMICOLON; RPAR;
LCURLY;
  BREAK; SEMICOLON;
  P;R;I;N;T; LPAR; 1; RPAR; SEMICOLON;
RCURLY;
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Continue" jumps to the next cycle',
          source: `
FOR; LPAR;
  I; ASSIGN; 0; SEMICOLON;
  I; LT; 2; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  CONTINUE; SEMICOLON;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
RCURLY;
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Controlling variable can be changed inside',
          source: `
FOR; LPAR;
  I; ASSIGN; 0; SEMICOLON;
  I; LT; 4; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; RPAR;
LCURLY;
  P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; SEMICOLON;
RCURLY;
`,
          output: '0\n2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'For cycle reuses environment variable',
          source: `
I; ASSIGN; 0; SEMICOLON;
FOR; LPAR;
  I; ASSIGN; 0; SEMICOLON;
  I; LT; 2; SEMICOLON;
  I; ASSIGN; I; PLUS; 1; RPAR;
LCURLY;
RCURLY;
P;R;I;N;T; LPAR; I; RPAR; SEMICOLON;
`,
          output: '2',
          expected: ExpectedResult.MATCH_OUTPUT
        }
      ]
    },
    {
      name: 'Classes',
      tests: [
        {
          name: 'Instantiation calls init',
          source: `
CLASS; C;
LCURLY;
  FUNCTION; _;_;i;n;i;t;_;_; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; x; ASSIGN; x; SEMICOLON;
  RCURLY;
RCURLY;

a; ASSIGN; C; LPAR; 1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Method calls bind self',
          source: `
CLASS; C;
LCURLY;
  FUNCTION; m; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; x; ASSIGN; 1; SEMICOLON;
  RCURLY;
RCURLY;

a; ASSIGN; C; LPAR; RPAR; SEMICOLON;
a; PROP; m; LPAR; 1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Adding method at runtime',
          source: `
CLASS; C;
LCURLY;
RCURLY;

FUNCTION; m; LPAR; s;e;l;f; COMMA; x; RPAR;
LCURLY;
  s;e;l;f; PROP; x; ASSIGN; x; SEMICOLON; 
RCURLY;

a; ASSIGN; C; LPAR; RPAR; SEMICOLON;
a; PROP; m; ASSIGN; m; SEMICOLON;
a; PROP; m; LPAR; 1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Overriding __str__ works',
          source: `
CLASS; C;
LCURLY;
  FUNCTION; _;_;i;n;i;t;_;_; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; x; ASSIGN; x; SEMICOLON;
  RCURLY;

  FUNCTION; _;_;s;t;r;_;_; LPAR; s;e;l;f; RPAR;
  LCURLY;
    RETURN; s;e;l;f; PROP; x; SEMICOLON;
  RCURLY;
RCURLY;

a; ASSIGN; C; LPAR; QUOTE; f;o;o; QUOTE; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; RPAR; SEMICOLON;
`,
          output: 'foo',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Overriding __call__ works',
          source: `
CLASS; C;
LCURLY;
  FUNCTION; _;_;c;a;l;l;_;_; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; x; ASSIGN; x; SEMICOLON;
  RCURLY;
RCURLY;

a; ASSIGN; C; LPAR; RPAR; SEMICOLON;
a; LPAR; 1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
a; PROP; _;_;c;a;l;l;_;_; LPAR; 2; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
`,
          output: '1\n2',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Method is looked up in bases',
          source: `
CLASS; C;
LCURLY;
  FUNCTION; m; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; x; ASSIGN; x; SEMICOLON;
  RCURLY;
RCURLY;

CLASS; D; LPAR; C; RPAR;
LCURLY;
RCURLY;

a; ASSIGN; D; LPAR; RPAR; SEMICOLON;
a; PROP; m; LPAR; 1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
`,
          output: '1',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Super works',
          source: `
CLASS; C;
LCURLY;
  FUNCTION; m; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; x; ASSIGN; x; SEMICOLON;
  RCURLY;
RCURLY;

CLASS; D; LPAR; C; RPAR;
LCURLY;
  FUNCTION; m; LPAR; s;e;l;f; COMMA; x; RPAR;
  LCURLY;
    s;e;l;f; PROP; y; ASSIGN; x; SEMICOLON;
    s;u;p;e;r; PROP; m; LPAR; s;e;l;f; COMMA; x; RPAR; SEMICOLON;
  RCURLY;
RCURLY;

a; ASSIGN; D; LPAR; RPAR; SEMICOLON;
a; PROP; m; LPAR; 1; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; x; RPAR; SEMICOLON;
P;R;I;N;T; LPAR; a; PROP; y; RPAR; SEMICOLON;
`,
          output: '1\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        }
      ]
    },
    {
      name: 'Random',
      tests: [
        {
          name: 'Variable shadowing',
          source: `
A; ASSIGN; 0; SEMICOLON;
LCURLY;
  FUNCTION; F; LPAR; RPAR;
  LCURLY;
    P;R;I;N;T; LPAR; A; RPAR; SEMICOLON;
  RCURLY;

  F; LPAR; RPAR; SEMICOLON;
  A; ASSIGN; 1; SEMICOLON;
  F; LPAR; RPAR; SEMICOLON;
RCURLY;          
`,
          output: '0\n1',
          expected: ExpectedResult.MATCH_OUTPUT
        }
      ]
    }
  ]
}

const results = testSuites([parser, runtime])
console.log(`
>>> Total passed: ${results.passCount}
>>> Total failed: ${results.failCount}`)

//   /* Classes */
//   `CLASS; C; LCURLY;
//     FUNCTION; M;E;T;H;O;D; LPAR; RPAR; LCURLY; RCURLY;
// RCURLY;`,m85; SEMICOLON;`,
// ])
