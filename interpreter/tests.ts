import { Sign, signToCharMap } from './ast/sign'
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
  suites?: TestSuite[],
}

async function testSingle(test: Test)
  : Promise<{ didPass: boolean, desc: string }> {
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
    if (parseFailed) {
      didPass = false
    } else {
      didPass = true
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
  const interpreter = new Interpreter(
    {
      onInput: () => '',
      onPrint: (str) => outputs.push(str),
      onNextStep: async () => { return },
    })
  try {
    await interpreter.visitProgramStmt(program)
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
  const actualOutput = outputs.join('')
  if (!test.output || test.output === actualOutput) {
    didPass = true
  } else {
    didPass = false
    desc = `Expected: "${test.output}"\nActual: "${actualOutput}"`
  }

  return { didPass, desc }
}

async function testSuites(suites: TestSuite[], level: number = 0)
  : Promise<{ passCount: number, failCount: number }> {
  let passCount = 0
  let failCount = 0
  for (const suite of suites) {
    console.log(`${' '.repeat(2 * level)} > ${suite.name}`)
    if (suite.suites) {
      const curResults = await testSuites(suite.suites, level + 1)
      passCount += curResults.passCount
      failCount += curResults.failCount
    }
    if (suite.tests) {
      for (const test of suite.tests) {
        const { didPass, desc } = await testSingle(test)
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
ƒ F() {
  ⚹ 3;
}`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Nested functions',
              source: `
ƒ F1() {
  ƒ F2() { }
}`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Name starting with a number',
              source: `
ƒ 1N() { }`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Multiple parameters',
              source: `
ƒ F(P1, P2) { }`,
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
F();`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'With a single argument',
              source: `
F(A);`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Missing parentheses',
              source: `
F(;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Missing parentheses with argument',
              source: `
F(A;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'With multiple arguments',
              source: `
F(A1, A2);`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Invalid name of a function',
              source: `
1A();`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Nested function call',
              source: `
F1( F2() );`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Assignment to function call should fail',
              source: `
FUNC(ARG) ≔ 5;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Assignment to accesed function call should fail',
              source: `
ARR[0](ARG) ≔ 5;`,
              expected: ExpectedResult.FAIL_PARSE,
            },
            {
              name: 'Assignment to a member of a returned array value',
              source: `
FUNC(ARG)[0] ≔ 5;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Assignment to a member of a returned object value',
              source: `
FUNC(ARG)→PROP ≔ 5;`,
              expected: ExpectedResult.PASS_PARSE,
            },
            {
              name: 'Defining an anonymous function works',
              source: `
 J ≔ ƒ(){ };`,
              expected: ExpectedResult.PASS_PARSE,
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
[12, 42];`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Multidimensional array literal with values',
          source: `
[[1], 3];`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Empty array literal',
          source: `
[];`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Empty multidimensonal array literal',
          source: `
[[]];`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Assignment to an element.',
          source: `
[12, 42][0] ≔ 1;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Calling an array literal',
          source: `
[]();`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Assignment to calling an array literal should fail',
          source: `
[]() ≔ 3;`,
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
A ≔ B ≔ 0;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Dangling assign operator should fail',
          source: `
A ≔ ;`,
          expected: ExpectedResult.FAIL_PARSE
        }
      ]
    },
    {
      name: 'Identifier names',
      tests: [
        {
          name: 'Identifier cannot start with a digit',
          source: `
1ALFA;`,
          expected: ExpectedResult.FAIL_PARSE
        },
        {
          name: 'Identifier can start with letter and contain alphanum',
          source: `
I1ALFA;`,
          expected: ExpectedResult.PASS_PARSE
        },
        {
          name: 'Identifier can contain auxletters as first char',
          source: `
αALFAβBETA;`,
          expected: ExpectedResult.PASS_PARSE
        },
      ]
    }
  ],
}

const runtime = {
  name: 'Language',
  suites: [
    {
      name: 'Strings',
      tests: [
        {
          name: 'String can contain auxletter',
          source: `
λ("αβ");
`,
          output: 'αβ\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'String can contain any valid token (except QUOTE)',
          source: `
λ("≤>=✓");
`,
          output: '≤>=✓\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'String cannot contain unknown token',
          source: `
λ("&&");
`,
          expected: ExpectedResult.FAIL_PARSE
        }
      ]
    },
    {
      name: 'Functions',
      tests: [
        {
          name: 'Fibonacci',
          source: `
ƒ FIB(X)
{  
  ☝(X = 0) 
  {
    ⚹ 0;
  }
  ☝(X = 1)
    ⚹ 1;
  
  ⚹ FIB(X - 1) + FIB(X - 2);
}

λ(FIB(10));
`,
          output: '55\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Returns complex object',
          source: `
ƒ F()
{  
  ⚹ [["A", 3], [✓, ✕]];
}

λ(F());
`,
          // tslint:disable-next-line:max-line-length
          output: `[[A, 3], [${signToCharMap.get(Sign.TRUE)}, ${signToCharMap.get(Sign.FALSE)}]]\n`,
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Closure captures enclosing environment',
          source: `
ƒ F()
{
  X ≔ 0;
  ƒ G() {
     X ≔ X + 1;
  }
  G();
  G();
  λ(X);
}

F();
`,
          output: '2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Closure captures variables defined after it',
          source: `
ƒ F()
{
  ƒ G() {
     X ≔ X + 1;
  }
  X ≔ 0;
  G();
  G();
  λ(X);
}

F() ;
`,
          output: '2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '(Bug) Break statement outside for/while break execution',
          source: `
ƒ F() {
  ⚻;
  λ(1);
}

F();
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '(Bug) Continue statement outside for/while break execution',
          source: `
ƒ F() {
  ⚺;
  λ(1);
}

F();
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Passing callback',
          source: `
ƒ F(G) {
  ⚹ G(G(0));
}

ƒ INC(X) {
  ⚹ X + 1;
}

λ(F(INC));
`,
          output: '2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Returning function works',
          source: `
ƒ F() {
  I ≔ 0;
  ƒ COUNT() {
    I ≔ I + 1;
    λ(I);
  }
  ⚹ COUNT;
}

C ≔ F();
C();
C();
`,
          output: '1\n2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Accessing __CALL__ works',
          source: `
ƒ F(X) {
  λ(X);
}

F→__CALL__(1);
F→__CALL__→__CALL__(1);
`,
          output: '1\n1\n',
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
☝(✓)
  λ(1);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Negative if',
          source: `
☝(✕)
  λ(1);
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Omitting brackets should fail',
          source: `
☝✓
  λ(1);
`,
          expected: ExpectedResult.FAIL_PARSE
        },
        {
          name: 'Positive if else',
          source: `
☝(✓)
  λ(1);
☞
  λ(0);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Negative if else',
          source: `
☝(✕)
  λ(1);
☞
  λ(0);
`,
          output: '0\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Else if',
          source: `
X ≔ 0;
☝(X = 0)
  λ(0);
☞☝(X = 1)
  λ(1);
☞
  λ(2);

X ≔ 1;
☝(X = 0)
  λ(0);
☞☝(X = 1)
  λ(1);
☞
  λ(2);

X ≔ 2;
☝(X = 0)
 λ(0);
☞☝(X = 1)
 λ(1);
☞
 λ(2);
`,
          output: '0\n1\n2\n',
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
I ≔ 0;
⟳(I < 2) {
  λ(I);
  I ≔ I + 1;
}
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Continue" jumps to the next cycle',
          source: `
I ≔ 0;
⟳(I < 2) {
  I ≔ I + 1;
  λ(I);
  ⚺;
  λ(I);
}
`,
          output: '1\n2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Break" jumps out of the loop',
          source: `
I ≔ 0;
⟳(I < 3) {
  ☝(I = 2) { ⚻; }
  λ(I);
  I ≔ I + 1;
}
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Return" jumps out of the loop',
          source: `
ƒ F() {
  ⟳(✓) {
    ⚹ 1;
  }
}

λ(F()) ;
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Continue" affect enclosing while.',
          source: `
I ≔ 0;
⟳(I < 2) {
  J ≔ 3;
  ⟳(J < 5) {
    J ≔ J + 1;
    ⚺;
    λ(I);
  }

  λ(I);
  I ≔ I + 1;
}
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Break" affect enclosing while.',
          source: `
I ≔ 0;
⟳(I < 2) {
  ⟳(✓) {
    ⚻;
  }

  λ(I) ;
  I ≔ I + 1;
}
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Return" jumps out of multiple loops',
          source: `
ƒ F() {
  ⟳(✓) {
    ⟳(✓) {
      ⚹ 1;
    }
  }
}

λ(F());
`,
          output: '1\n',
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
X ≔ 0;
♶(;;) {
  X ≔ 1;
  ⚻;
}
λ(X);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'for(i = 0; i < 2; ++i) works',
          source: `
♶(I ≔ 0; I < 2; I ≔ I + 1) {
  λ(I);
}
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'for(i = 0, j = 4; i !=  j ++i, --j) works',
          source: `
♶(I ≔ 0, J ≔ 4; I ≠ J; I ≔ I + 1 , J ≔ J - 1) {
  λ(I, J);
}
`,
          output: '0 4\n1 3\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Break" jumps out of the cycle',
          source: `
♶(;;) {
  ⚻;
  λ(1);
}
`,
          output: '',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: '"Continue" jumps to the next cycle',
          source: `
♶(I ≔ 0; I < 2; I ≔ I + 1) {
  λ(I);
  ⚺;
  λ(I);
}
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Control variable can be changed inside',
          source: `
♶(I ≔ 0; I < 4; I ≔ I + 1) {
  λ(I);
  I ≔ I + 1;
}
`,
          output: '0\n2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'For cycle reuses environment variable',
          source: `
I ≔ 0;
♶(I ≔ 0; I < 2; I ≔ I + 1) { }
λ(I);
`,
          output: '2\n',
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
⚛ C {
  ƒ __INIT__(SELF, X) {
     SELF→X ≔ X;
  }
}

A ≔ C(1);
λ(A→X);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Method calls bind self',
          source: `
⚛ C {
  ƒ M(SELF, X) {
    SELF→X ≔ 1;
  }
}

A ≔ C();
A→M(1);
λ(A→X);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Adding method at runtime',
          source: `
⚛ C { }

ƒ M(SELF, X) {
   SELF→X ≔ X; 
}

A ≔ C();
A→M ≔ M;
A→M(1);
λ(A→X);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Overriding __str__ works',
          source: `
⚛ C {
  ƒ __INIT__(SELF, X) {
     SELF→X ≔ X;
  }

  ƒ __STR__(SELF) {
    ⚹ SELF→X;
  }
}

A ≔ C("FOO");
λ(A);
`,
          output: 'FOO\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Overriding __call__ works',
          source: `
⚛ C {
  ƒ __CALL__(SELF, X) {
    SELF→X ≔ X;
  }
}

A ≔ C();
A(1);
λ(A→X);
A→__CALL__(2);
λ(A→X);
`,
          output: '1\n2\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Method is looked up in bases',
          source: `
⚛ C {
  ƒ M(SELF, X) {
    SELF→X ≔ X;
  }
}

⚛ D(C) {
}

A ≔ D();
A→M(1);
λ(A→X);
`,
          output: '1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        },
        {
          name: 'Super works',
          source: `
⚛ C {
  ƒ M(SELF, X) {
    SELF→X ≔ X;
  }
}

⚛ D(C) {
  ƒ  M(SELF, X) {
    SELF→Y ≔ X;
    SUPER→M(SELF, X);
  }
}

A ≔ D();
A→M(1);
λ(A→X);
λ(A→Y);
`,
          output: '1\n1\n',
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
A ≔ 0;
{
  ƒ F() {
    λ(A);
  }

  F();
  A ≔ 1;
  F();
}          
`,
          output: '0\n1\n',
          expected: ExpectedResult.MATCH_OUTPUT
        }
      ]
    }
  ]
}

testSuites([parser, runtime]).then((results) =>
  console.log(`
>>> Total passed: ${results.passCount}
>>> Total failed: ${results.failCount}`)
)

//   /* Classes */
//   `CLAS S C{
//     ƒ  METHOD() { }
// }`,m85;`,
// ])
