%lex

DELIMITER   				";"
VALID_CHAR					([A-Z]|[0-9])	

%x delimit

%%

"LT"						{ this.begin('delimit'); return 'LT'; }
"LE"						{ this.begin('delimit'); return 'LE'; }
"EQ"						{ this.begin('delimit'); return 'EQ'; }
"NE"						{ this.begin('delimit'); return 'NE'; }
"GE"						{ this.begin('delimit'); return 'GE'; }
"GT"						{ this.begin('delimit'); return 'GT'; }

"LPAR"						{ this.begin('delimit'); return 'LPAR'; }
"RPAR"						{ this.begin('delimit'); return 'RPAR'; }

"PLUS"						{ this.begin('delimit'); return 'PLUS'; }
"MINUS"						{ this.begin('delimit'); return 'MINUS'; }
"MUL"						{ this.begin('delimit'); return 'MUL'; }
"DIV"						{ this.begin('delimit'); return 'DIV'; }
"MOD"						{ this.begin('delimit'); return 'MOD'; }

"TRUE"						{ this.begin('delimit'); return 'TRUE'; }
"FALSE"						{ this.begin('delimit'); return 'FALSE'; }

"DOT"						{ this.begin('delimit'); return 'DOT'; }
"QUOTE"						{ this.begin('delimit'); return 'QUOTE'; }
[A-Z]						{ this.begin('delimit'); return 'LETTER'; }
[0-9]						{ this.begin('delimit'); return 'DIGIT'; }

<delimit>{DELIMITER}		this.popState();

<delimit>\s+				/* ignore whitespace */
\s+							/* ignore whitespace */
<delimit>.					throw new Error('Delimiter expected');
.							{console.log(yytext); throw new Error('Unknown gifcode'); }

<delimit><<EOF>>			throw new Error('Delimiter expected');
<<EOF>>                     return 'EOF';

/lex

%left PLUS MINUS OR
%left MUL MOD DIV AND

%start expression

%%

id
	: id_ {$$ = {type: 'id', value: $1};}
	;

id_:
	LETTER alfanum {$$ = $1 + $2;}
	;

alfanum
	: alfanum_atom alfanum {$$ = $1 + $2;}
	| {$$ = '';}
	;

alfanum_atom:
	LETTER {$$ = $1;}
	| DIGIT {$$ = $1;}
	;

ufloat
	: ufloat_ {$$ = {type: 'ufloat', value: Number($1)};}
	;

ufloat_
	: uint DOT uint {$$ = $1 + '.' + $3;}
	;

uint
	: uint_ {$$ = {type: 'uint', value: Number($1)};}
	;

uint_
	: DIGIT uint {$$ = $1 + $2;}
	| DIGIT {$$ = $1;}
	;

string
	: QUOTE alfanum QUOTE {$$ = {type: 'string', value: $2};}
	;

constant
	: uint {$$ = $1;}
	| ufloat {$$ = $1;}
	| string {$$ = $1;}
	| TRUE {$$ = {type: 'bool', value: true};}
	| FALSE {$$ = {type: 'bool', value: false};}
	;

factor
	: constant {$$ = $1;}
	| LPAR expression RPAR {$$ = $2;}
	;

expression
	: simple_exp LT simple_exp {$$ = {type: 'comparison', kind: '<', left: $1, right: $3};}
	| simple_exp LE simple_exp {$$ = {type: 'comparison', kind: '<=', left: $1, right: $3};}
	| simple_exp EQ simple_exp {$$ = {type: 'comparison', kind: '==', left: $1, right: $3};}
	| simple_exp NE simple_exp {$$ = {type: 'comparison', kind: '!=', left: $1, right: $3};}
	| simple_exp GE simple_exp {$$ = {type: 'comparison', kind: '>=', left: $1, right: $3};}
	| simple_exp GT simple_exp {$$ = {type: 'comparison', kind: '>', left: $1, right: $3};}
	| simple_exp {$$ = $1;}
	;

simple_exp
	: PLUS num_exp {$$ = {type: 'unarySign', kind: '+', operand: $2};}
	| MINUS num_exp {$$ = {type: 'unarySign', kind: '-', operand: $2};}
	| num_exp {$$ = $1;}
	;

num_exp
	: num_exp PLUS numP_exp {$$ = {type: 'operation', kind: '+', left: $1, right: $3};}
	| num_exp MINUS numP_exp {$$ = {type: 'operation', kind: '-', left: $1, right: $3};}
	| num_exp OR numP_exp {$$ = {type: 'operation', kind: '||', left: $1, right: $3};}
	| numP_exp {$$ = $1;}
	;

numP_exp
	: numP_exp MUL factor {$$ = {type: 'operation', kind: '*', left: $1, right: $3};}
    | numP_exp DIV factor {$$ = {type: 'operation', kind: '/', left: $1, right: $3};}
	| numP_exp MOD factor {$$ = {type: 'operation', kind: '%', left: $1, right: $3};}
	| numP_exp AND factor {$$ = {type: 'operation', kind: '&&', left: $1, right: $3};}
	| factor
	;