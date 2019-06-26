import { parser } from './giflang.jison';
import * as AstNodes from './ast-nodes';

parser.yy = AstNodes;

function should_fail(test : any) {
    let did_fail = true;
    try {
        test();
    } catch {
        did_fail = false;
    } finally {
        console.log(did_fail ? 'FAIL' : 'OK');
    }
}
/* Functions */

/* Definition */
parser.parse(`
FUNCTION; D; LPAR; P;1; COMMA; P;2; RPAR;
LCURLY; RETURN; 3; SEMICOLON; RCURLY;
`);
console.log('OK');

/* Call */
parser.parse(`
F;U;N;C; LPAR; A;R;G; RPAR; SEMICOLON;
`)
console.log('OK');

/* Assignment to function call should fail. */
should_fail(
    () => parser.parse(
`F;U;N;C; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`
));

/* Assignment to accesed function call should fail. */
should_fail(
    () => parser.parse(
`A;R;R; LBRA; 0; RBRA; LPAR; A;R;G; RPAR; ASSIGN; 5; SEMICOLON;`
));

/* Assignment to a member. */
parser.parse(
`F;U;N;C; LPAR; A;R;G; RPAR; LBRA; 0; RBRA; ASSIGN; 5; SEMICOLON;`
);
console.log('OK');

parser.parse(
    `F;U;N;C; LPAR; A;R;G; RPAR; DOT; P;R;O;P; ASSIGN; 5; SEMICOLON;`
    );
    console.log('OK');