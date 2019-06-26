import { parser } from './giflang.jison';
import * as AstNodes from './ast-nodes';

parser.yy = AstNodes;

function should_fail(program : any) {
    let did_fail = true;
    try {
        parser.parse(program);
    } catch {
        did_fail = false;
    } finally {
        console.log(did_fail ? 'FAIL' : 'OK');
    }
}

function should_pass(program : any) {
    parser.parse(program);
    console.log("OK");
}

function test(programs : any) {
    for (const program of programs) {
        if (typeof program === 'string') {
            should_pass(program);
        } else {
            should_fail(program);
        }
    }
}

test([
/* Functions */
/* Definition */
`FUNCTION; D; LPAR; P;1; COMMA; P;2; RPAR;
LCURLY; RETURN; 3; SEMICOLON; RCURLY;`,
/* Call */
`F;U;N;C; LPAR; A;R;G; RPAR; SEMICOLON;`,
/* Assignment to function call should fail. */
[`F;U;N;C; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`],
/* Assignment to accesed function call should fail. */
[`A;R;R; LBRA; 0; RBRA; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`],
/* Assignment to a member. */
`F;U;N;C; LPAR; A;R;G; RPAR; LBRA; 0; RBRA; ASSIGN; 5; SEMICOLON;`,
`F;U;N;C; LPAR; A;R;G; RPAR; DOT; P;R;O;P; ASSIGN; 5; SEMICOLON;`,

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
`A; ASSIGN; B; ASSIGN; 0; SEMICOLON;`
]);
