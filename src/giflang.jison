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

"IF"						{ return delimit('IF'); }
"ELSE"						{ return delimit('ELSE'); }
"WHILE"						{ return delimit('WHILE'); }
"FOR"						{ return delimit('FOR'); }

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

%nonassoc IF_WITHOUT_ELSE
%nonassoc ELSE

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
	: LETTER Alfanum {$$ = new yy.Identifier($1 + $2);}
	;

Alfanum
	: AlfanumAtom Alfanum {$$ = $1 + $2;}
	| {$$ = '';}
	;

AlfanumAtom
	: LETTER {$$ = $1;}
	| DIGIT {$$ = $1;}
	;

UFloat
	: UInt_ DOT UInt_ {$$ = new yy.FloatLiteral($1 + '.' + $3);}
	;

UInt
	: UInt_ {$$ = new yy.UIntLiteral($1);}
	;

UInt_
	: UInt_ DIGIT {$$ = $1 + $2;}
	| DIGIT {$$ = $1;}
	;

String
	: QUOTE Alfanum QUOTE {$$ = new yy.StringLiteral($2);}
	;

PrimaryExpr
    : Literal
	| CallExpr
    ;

PrimaryComnon
	: Identifier
    | LPAR Expr RPAR
	| ArrayLiteral
	;

Literal
    : TRUE
		{$$ = new yy.Identifier('TRUE');}
    | FALSE
		{$$ = new yy.Identifier('FALSE');}
	| NULL
		{$$ = new yy.NullLiteral();}
    | UFloat
		{$$ = $1;}
	| UInt
		{$$ = $1;}
    | String
		{$$ = $1;}
    ;

ArrayLiteral
    : LBRA ElementList RBRA
	| LBRA RBRA
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
    | LPAR ElementList RPAR
    ;

ElementList
    : Expr
    | ElementList COMMA Expr
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

Statement
	: Block
	| Assignment SEMICOLON
	| Expr SEMICOLON
	| /* Empty statement */ SEMICOLON
	| IfStatement
	| IterationStatement
	| ReturnStatement
	| ContinueStatement
	| BreakStatement
	;

Block
    : LCURLY RCURLY
    | LCURLY StatementList RCURLY
    ;

StatementList
	: Statement
	| StatementList Statement
	;

Assignment
	: MemberExpr ASSIGN Assignment
	| MemberExpr ASSIGN Expr { $$ = $1; }
	;

IfStatement
    : IF LPAR Expr RPAR Statement %prec IF_WITHOUT_ELSE
    | IF LPAR Expr RPAR Statement ELSE Statement
    ;

IterationStatement
    : WHILE LPAR Expr RPAR Statement
    | FOR LPAR 
		AssignmentListOptional SEMICOLON
	  	ExprOptional SEMICOLON
		AssignmenOrExprListOptional 
		RPAR Statement
    ;

AssignmentList
	: AssignmentList COMMA Assignment
	| Assignment
	;

AssignmentListOptional
	: AssignmentList
	| %epsilon
	;

AssignmenOrExprList
	: AssignmenOrExprList COMMA Assignment
	| AssignmenOrExprList COMMA Expr
	| Assignment
	| Expr
	;

AssignmenOrExprListOptional
	: AssignmenOrExprList
	| %epsilon
	;

ReturnStatement
	: RETURN SEMICOLON
	| RETURN Expr SEMICOLON
	;

ContinueStatement
    : CONTINUE SEMICOLON
    ;

BreakStatement
    : BREAK SEMICOLON
    ;

FunctionNamed
	: FUNCTION Identifier Parameters Block { $$ = $1; }
	;

IdentifierList
	: Identifier { $$ = $1; }
	| IdentifierList COMMA Identifier { $$ = $1; }
	;

Parameters
	: LPAR IdentifierList RPAR { $$ = $1; }
	| LPAR RPAR { $$ = $1; }
	;
