%lex

%{

/*  After reading a lexeme, go to "delimit" state to
  	expect delimiter and return the lexeme. Arrow function
	is used to bind this. */
var delimit = (terminal) => 
    { 
        this.begin('delimit'); return terminal;
    }
%}

DELIMITER   				";"
VALID_CHAR					([A-Z]|[0-9])	

%x delimit

%%

"LT"						{ return delimit('LT'); }
"LE"						{ return delimit('LE'); }
"EQ"						{ return delimit('EQ'); }
"NE"						{ return delimit('NE'); }
"GE"						{ return delimit('GE'); }
"GT"						{ return delimit('GT'); }

"PLUS"						{ return delimit('PLUS'); }
"MINUS"						{ return delimit('MINUS'); }
"MUL"						{ return delimit('MUL'); }
"DIV"						{ return delimit('DIV'); }
"MOD"						{ return delimit('MOD'); }

"NOT"						{ return delimit('NOT'); }
"OR"						{ return delimit('OR'); }
"AND"						{ return delimit('AND'); }

"ASSIGN"					{ return delimit('ASSIGN'); }
"TRUE"						{ return delimit('TRUE'); }
"FALSE"						{ return delimit('FALSE'); }

"LPAR"						{ return delimit('LPAR'); }
"RPAR"						{ return delimit('RPAR'); }
"LBRA"						{ return delimit('LBRA'); }
"RBRA"						{ return delimit('RBRA'); }
"LCURLY"					{ return delimit('LCURLY'); }
"RCURLY"					{ return delimit('RCURLY'); }

"FUNCTION"					{ return delimit('FUNCTION'); }
"RETURN"					{ return delimit('RETURN'); }

"SEMICOLON"					{ return delimit('SEMICOLON'); }
"DOT"						{ return delimit('DOT'); }
"COMMA"						{ return delimit('COMMA'); }
"QUOTE"						{ return delimit('QUOTE'); }
[A-Z]						{ return delimit('LETTER'); }
[0-9]						{ return delimit('DIGIT'); }

<delimit>{DELIMITER}		this.popState();

<delimit>\s+				/* ignore whitespace */
\s+							/* ignore whitespace */
<delimit>.					throw new Error('Delimiter expected: ' + yytext);
.							{console.log(yytext); throw new Error('Unknown gifcode'); }

<delimit><<EOF>>			throw new Error('Delimiter expected');
<<EOF>>                     return 'EOF';

/lex

/* operator associations and precedence */

%left OR
%left AND
%left EQ NE
%left LT LE GE GT
%left PLUS MINUS
%left MUL DIV MOD

%start Program

%%
/* Nezabudni:
	 - v ArrayLiteral mozu byt aj priradenia
*/
Program
	: Program FunctionNamed { $$ = $2; }
	| Program Statement { $$ = $2; }
	| Program EOF { $$ = $1; }
	| %epsilon
	;

Identifier
	: Identifier_ {$$ = new yy.Identifier($1);}
	;

Identifier_
	: LETTER alfanum {$$ = $1 + $2;}
	;

alfanum
	: alfanum_atom alfanum {$$ = $1 + $2;}
	| {$$ = '';}
	;

alfanum_atom
	: LETTER {$$ = $1;}
	| DIGIT {$$ = $1;}
	;

ufloat
	: ufloat_ {$$ = new yy.FloatLiteral($1);}
	;

ufloat_
	: uint_ DOT uint_ {$$ = $1 + '.' + $3;}
	;

uint
	: uint_ {$$ = new yy.UIntLiteral($1);}
	;

uint_
	: uint DIGIT {$$ = $1 + $2;}
	| DIGIT {$$ = $1;}
	;

string
	: QUOTE alfanum QUOTE {$$ = new yy.StringLiteral($2);}
	;

PrimaryExpr
    : Literal
	| CallExpr
    ;

PrimaryComnon
	: Identifier
    | LPAR Expr RPAR
    /* TODO:
	| ArrayLiteral
	*/
	;

Literal
    : TRUE
		{$$ = new yy.Identifier('TRUE');}
    | FALSE
		{$$ = new yy.Identifier('FALSE');}
	| NULL
		{$$ = new yy.NullLiteral();}
    | ufloat
		{$$ = $1;}
	| uint
		{$$ = $1;}
    | string
		{$$ = $1;}
    ;

MemberExpr
    : PrimaryComnon
	| CallExpr LBRA Expr RBRA
    | CallExpr DOT Identifier
    ;

CallExpr
    : MemberExpr Arguments
	| MemberExpr
	;

Arguments
    : LPAR RPAR
    | LPAR ArgumentList RPAR
    ;

ArgumentList
    : Expr
    | ArgumentList COMMA Expr
    ;

UnaryExpr
	: PLUS UnaryExpr
		{$$ = new yy.UnaryExpression(yy.Operator.PLUS, $2);}
	| MINUS UnaryExpr
		{$$ = new yy.UnaryExpression(yy.Operator.MINUS, $2);}
	| NOT UnaryExpr
		{ $$ = new yy.UnaryExpression(yy.Operator.NOT, $2); }
	| PrimaryExpr { $$ = $1; }
	;

Expr
	: Expr MUL UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.MUL, $1, $3);}
    | Expr DIV UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.DIV, $1, $3);}
	| Expr MOD UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.MOD, $1, $3);}

	| Expr PLUS UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.PLUS, $1, $3);}
	| Expr MINUS UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.MINUS, $1, $3);}

	| Expr LT UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.LT, $1, $3);}
	| Expr LE UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.LE, $1, $3);}
	| Expr GE UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.GE, $1, $3);}
	| Expr GT UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.GT, $1, $3);}

	| Expr EQ UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.EQ, $1, $3);}
	| Expr NE UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.NE, $1, $3);}

	| Expr AND UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.AND, $1, $3);}
	| Expr OR UnaryExpr {$$ = new yy.BinaryExpression(yy.Operator.OR, $1, $3);}
	| UnaryExpr { $$ = $1;}
	;

SimpleStatement
	: MemberExpr ASSIGN Expr { $$ = $1; }
	| Expr { $$ = $1; }
	;
	
Statement
	: SimpleStatement SEMICOLON { $$ = $1; }
	| EmptyStatement
	/* TODO: A lot. */
	;

EmptyStatement
	: SEMICOLON
	;
FunctionNamed
	: FUNCTION Identifier Parameters LCURLY FunctionBody RCURLY { $$ = $1; }
	;

IdentifierList
	: Identifier { $$ = $1; }
	| IdentifierList COMMA Identifier { $$ = $1; }
	;

Parameters
	: LPAR IdentifierList RPAR { $$ = $1; }
	| LPAR RPAR { $$ = $1; }
	;

FunctionBody
	: FunctionBody Statement { $$ = $1; }
	| FunctionBody RETURN Expr SEMICOLON { $$ = $1; }
	| %epsilon
	;
