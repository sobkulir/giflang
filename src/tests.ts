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
1; LPAR; RPAR; SEMICOLON;`,
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
F;U;N;C; LPAR; A;R;G; RPAR; DOT; P;R;O;P; ASSIGN; 5; SEMICOLON;`,
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
  name: 'Runtime',
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
        }
      ]
    },
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
