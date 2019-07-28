%lex

%{

/*  After reading a lexeme go to "delimit" state to
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
"NONE"						{ return delimit('NONE'); }

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

"CLASS"						{ return delimit('CLASS');}
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

Program
	: Program Statement			{ $1.push($2); $$ = $1; }
	| Program ClassDefinition	{ $1.push($2); $$ = $1; }
	| Program EOF				{ $$ = new yy.Stmt.ProgramStmt($1); }
	| %epsilon					{ $$ = []; }
	;

Identifier
	: LETTER Alfanum 			{ $$ = $1 + $2 }
	;

Alfanum
	: AlfanumAtom Alfanum 		{ $$ = $1 + $2; }
	| %epsilon 					{ $$ = ''; }
	;

AlfanumAtom
	: LETTER 	{ $$ = $1; }
	| DIGIT 	{ $$ = $1; }
	;

UFloat
	: UInt_ DOT UInt_			{ $$ = new yy.Expr.NumberValueExpr($1 + '.' + $3); }
	;

UInt
	: UInt_ 	{ $$ = new yy.Expr.NumberValueExpr($1); }
	;

UInt_
	: UInt_ DIGIT 				{ $$ = $1 + $2; }
	| DIGIT 					{ $$ = $1; }
	;

String
	: QUOTE Alfanum QUOTE 		{ $$ = new yy.Expr.StringValueExpr($2); }
	;

PrimaryExpr
    : Literal 	{ $$ = $1; }
	| CallExpr 	{ $$ = $1; }
    ;

PrimaryComnon
	: Identifier 				{ $$ = new yy.Expr.VariableRefExpr($1); }
    | LPAR Expr RPAR 			{ $$ = $2; }
	| ArrayLiteral 				{ $$ = $1; }
	;

Literal
    : TRUE		{ $$ = new yy.Expr.VariableRefExpr('TRUE'); }
    | FALSE		{ $$ = new yy.Expr.VariableRefExpr('FALSE'); }
	| NONE		{ $$ = new yy.Expr.NoneValueExpr(); }
    | UFloat	{ $$ = $1; }
	| UInt		{ $$ = $1; }
    | String	{ $$ = $1; }
    ;

ArrayLiteral
    : LBRA ElementList RBRA 	{ $$ = new yy.Expr.ArrayValueExpr($2); }
	| LBRA RBRA					{ $$ = new yy.Expr.ArrayValueExpr([]); }
	;

MemberExpr
    : PrimaryComnon				{ $$ = $1; }
	| CallExpr LBRA Expr RBRA	{ $$ = new yy.Expr.SquareAccessorRefExpr($1, $3); }
    | CallExpr DOT Identifier	{ $$ = new yy.Expr.DotAccessorRefExpr($1, $3); }
    ;

CallExpr
    : MemberExpr Arguments		{ $$ = new yy.Expr.CallValueExpr($1, $2); }
	| MemberExpr				{ $$ = $1; }
	;

Arguments
    : LPAR RPAR					{ $$ = []; }
    | LPAR ElementList RPAR		{ $$ = $2; }
    ;

ElementList
    : Expr
		{ $$ = [$1] }
    | ElementList COMMA Expr
		{ $1.push($3); $$ = $1; }
    ;

UnaryExpr
	: PLUS UnaryExpr
		{$$ = new yy.Expr.UnaryPlusMinusValueExpr(yy.Operator.PLUS, $2);}
	| MINUS UnaryExpr
		{$$ = new yy.Expr.UnaryPlusMinusValueExpr(yy.Operator.MINUS, $2);}
	| NOT UnaryExpr
		{ $$ = new yy.Expr.UnaryNotValueExpr($2); }
	| PrimaryExpr { $$ = $1; }
	;

Expr
	: Expr MUL UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.MUL, $1, $3);}
    | Expr DIV UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.DIV, $1, $3);}
	| Expr MOD UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.MOD, $1, $3);}

	| Expr PLUS UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.PLUS, $1, $3);}
	| Expr MINUS UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.MINUS, $1, $3);}

	| Expr LT UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.LT, $1, $3);}
	| Expr LE UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.LE, $1, $3);}
	| Expr GE UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.GE, $1, $3);}
	| Expr GT UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.GT, $1, $3);}

	| Expr EQ UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.EQ, $1, $3);}
	| Expr NE UnaryExpr 		{$$ = new yy.Expr.BinaryValueExpr(yy.Operator.NE, $1, $3);}

	| Expr AND UnaryExpr 		{$$ = new yy.Expr.LogicalValueExpr(yy.Operator.AND, $1, $3);}
	| Expr OR UnaryExpr 		{$$ = new yy.Expr.LogicalValueExpr(yy.Operator.OR, $1, $3);}
	| UnaryExpr 				{ $$ = $1;}
	;

Statement
	: Block 					{ $$ = $1; }
	| Assignment SEMICOLON		{ $$ = $1; }
	| FunctionDeclaration		{ $$ = $1; }
	| Expr SEMICOLON			{ $$ = $1; }
	| /* Empty statement */ SEMICOLON
		{ $$ = new yy.Stmt.EmptyStmt(); }
	| IfStatement				{ $$ = $1; }
	| IterationStatement		{ $$ = $1; }
	| ReturnStatement			{ $$ = $1; }
	| ContinueStatement			{ $$ = $1; }
	| BreakStatement			{ $$ = $1; }
	;

Block
    : LCURLY RCURLY
		{ $$ = new yy.Stmt.BlockStmt([]); }
    | LCURLY StatementList RCURLY
		{ $$ = new yy.Stmt.BlockStmt($2); }
    ;

StatementList
	: Statement
		{ $$ = [$1] }
	| StatementList Statement
		{ $1.push($2); $$ = $1; }
	;

Assignment
	: MemberExpr ASSIGN Assignment
		{ $$ = new yy.Expr.AssignmentValueExpr($1, $3); }
	| MemberExpr ASSIGN Expr
		{ $$ = new yy.Expr.AssignmentValueExpr($1, $3); }
	;

FunctionDeclaration
	: FUNCTION Identifier Parameters Block
		{ $$ = new yy.Stmt.FunctionDeclStmt($2, $3, $4); }
	;

Parameters
	: LPAR IdentifierList RPAR		{ $$ = $2; }
	| LPAR RPAR						{ $$ = []; }
	;

IdentifierList
	: Identifier 						{ $$ = [$1]; }
	| IdentifierList COMMA Identifier	{ $1.push($3); $$ = $1; }
	;

IfStatement
    : IF LPAR Expr RPAR Statement %prec IF_WITHOUT_ELSE
		{ $$ = new yy.Stmt.IfStmt($3, $5, null); }
    | IF LPAR Expr RPAR Statement ELSE Statement
		{ $$ = new yy.Stmt.IfStmt($3, $5, $7); }
    ;

IterationStatement
    : WHILE LPAR Expr RPAR Statement
		{ $$ = new yy.Stmt.WhileStmt($3, $5); }
    | FOR LPAR
		AssignmentOrExprListOptional SEMICOLON
	  	ExprOptional SEMICOLON
		AssignmentOrExprListOptional 
		RPAR Statement
		{ $$ = new yy.Stm.ForStmt($3, $5, $7, $9); }
    ;

ExprOptional
	: Expr		{ $$ = $1; }
	| %epsilon 	{ $$ = null; }
	;

AssignmentOrExprList
	: AssignmentOrExprList COMMA Assignment
		{ $1.push($3); $$ = $1; }
	| AssignmentOrExprList COMMA Expr
		{ $1.push($3); $$ = $1; }
	| Assignment
		{ $$ = [$1]; }
	| Expr
		{ $$ = [$1]; }
	;

AssignmentOrExprListOptional
	: AssignmentOrExprList			{ $$ = $1; }
	| %epsilon						{ $$ = []; }
	;

ReturnStatement
	: RETURN SEMICOLON				{ $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.RETURN, null); }
	| RETURN Expr SEMICOLON			{ $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.RETURN, $2); }
	;

ContinueStatement
    : CONTINUE SEMICOLON			{ $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.CONTINUE, null); }
    ;

BreakStatement
    : BREAK SEMICOLON				{ $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.BREAK, null); }
    ;

ClassDefinition
	: CLASS Identifier ClassBlock	{ $$ = new yy.Stmt.ClassDeclStmt($2, $3.assignments, $3.methods); }
	;

ClassBlock
	: LCURLY RCURLY
		{ $$ = []; }
	| LCURLY InClassStatementList RCURLY
		{ $$ = $2; }
	;

InClassStatementList
	: InClassStatementList InClassStatement
		{ $$ = $1.concat($2); }
	| InClassStatement
		{ $$ = [$1]; }
	;

InClassStatement
	: FunctionDeclaration			{ $$ = $1; }
	| Assignment SEMICOLON			{ $$ = $1; }
	;
