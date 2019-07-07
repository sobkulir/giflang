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
	: Program Statement			{ $1.body.push($2); $$ = $1; }
	| Program ClassDefinition 	{ $1.body.push($2); $$ = $1; }
	| Program EOF 				{ $$ = $1; }
	| %epsilon
		{ $$ = new yy.ProgramNode(); }
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
	: UInt_ DOT UInt_			{ $$ = new yy.FloatNode($1 + '.' + $3); }
	;

UInt
	: UInt_ 	{ $$ = new yy.UIntNode($1); }
	;

UInt_
	: UInt_ DIGIT 				{ $$ = $1 + $2; }
	| DIGIT 					{ $$ = $1; }
	;

String
	: QUOTE Alfanum QUOTE 		{ $$ = new yy.StringNode($2); }
	;

PrimaryExpr
    : Literal 	{ $$ = $1; }
	| CallExpr 	{ $$ = $1; }
    ;

PrimaryComnon
	: Identifier 				{ $$ = new yy.ResolveNode($1); }
    | LPAR Expr RPAR 			{ $$ = $2; }
	| ArrayLiteral 				{ $$ = $1; }
	;

Literal
    : TRUE		{ $$ = new yy.ResolveNode('TRUE'); }
    | FALSE		{ $$ = new yy.ResolveNode('FALSE'); }
	| NULL		{ $$ = new yy.NullNode(); }
    | UFloat	{ $$ = $1; }
	| UInt		{ $$ = $1; }
    | String	{ $$ = $1; }
    ;

ArrayLiteral
    : LBRA ElementList RBRA 	{ $$ = new yy.ArrayNode($2); }
	| LBRA RBRA					{ $$ = new yy.ArrayNode(yy.ElementListNode()); }
	;

MemberExpr
    : PrimaryComnon				{ $$ = $1; }
	| CallExpr LBRA Expr RBRA	{ $$ = new yy.SquareAccessorNode($1, $3); }
    | CallExpr DOT Identifier	{ $$ = new yy.DotAccessorNode($1, $3); }
    ;

CallExpr
    : MemberExpr Arguments		{ $$ = new yy.FunctionCallNode($1, $2); }
	| MemberExpr				{ $$ = $1; }
	;

Arguments
    : LPAR RPAR					{ $$ = new yy.ElementListNode(); }
    | LPAR ElementList RPAR		{ $$ = $2; }
    ;

ElementList
    : Expr
		{ $$ = new yy.ElementListNode();
		  $$.elements.push($1); }
    | ElementList COMMA Expr
		{ $1.elements.push($3); $$ = $1; }
    ;

UnaryExpr
	: PLUS UnaryExpr
		{$$ = new yy.UnaryPlusMinusNode(yy.Operator.PLUS, $2);}
	| MINUS UnaryExpr
		{$$ = new yy.UnaryPlusMinusNode(yy.Operator.MINUS, $2);}
	| NOT UnaryExpr
		{ $$ = new yy.LogigalNotNode($2); }
	| PrimaryExpr { $$ = $1; }
	;

Expr
	: Expr MUL UnaryExpr {$$ = new yy.MultiplicationNode(yy.Operator.MUL, $1, $3);}
    | Expr DIV UnaryExpr {$$ = new yy.MultiplicationNode(yy.Operator.DIV, $1, $3);}
	| Expr MOD UnaryExpr {$$ = new yy.MultiplicationNode(yy.Operator.MOD, $1, $3);}

	| Expr PLUS UnaryExpr {$$ = new yy.AddNode(yy.Operator.PLUS, $1, $3);}
	| Expr MINUS UnaryExpr {$$ = new yy.AddNode(yy.Operator.MINUS, $1, $3);}

	| Expr LT UnaryExpr {$$ = new yy.RelationalNode(yy.Operator.LT, $1, $3);}
	| Expr LE UnaryExpr {$$ = new yy.RelationalNode(yy.Operator.LE, $1, $3);}
	| Expr GE UnaryExpr {$$ = new yy.RelationalNode(yy.Operator.GE, $1, $3);}
	| Expr GT UnaryExpr {$$ = new yy.RelationalNode(yy.Operator.GT, $1, $3);}

	| Expr EQ UnaryExpr {$$ = new yy.EqualNode(yy.Operator.EQ, $1, $3);}
	| Expr NE UnaryExpr {$$ = new yy.EqualNode(yy.Operator.NE, $1, $3);}

	| Expr AND UnaryExpr {$$ = new yy.BinaryLogicalNode(yy.Operator.AND, $1, $3);}
	| Expr OR UnaryExpr {$$ = new yy.BinaryLogicalNode(yy.Operator.OR, $1, $3);}
	| UnaryExpr { $$ = $1;}
	;

Statement
	: Block 					{ $$ = $1; }
	| Assignment SEMICOLON		{ $$ = $1; }
	| FunctionDeclaration		{ $$ = $1; }
	| Expr SEMICOLON			{ $$ = $1; }
	| /* Empty statement */ SEMICOLON
		{ $$ = new yy.EmptyStatementNode(); }
	| IfStatement				{ $$ = $1; }
	| IterationStatement		{ $$ = $1; }
	| ReturnStatement			{ $$ = $1; }
	| ContinueStatement			{ $$ = $1; }
	| BreakStatement			{ $$ = $1; }
	;

Block
    : LCURLY RCURLY
		{ $$ = new yy.BlockNode(new yy.ElementListNode()); }
    | LCURLY StatementList RCURLY
		{ $$ = new yy.BlockNode($2); }
    ;

StatementList
	: Statement
		{ $$ = new yy.ElementListNode();
		  $$.elements.push($1); }
	| StatementList Statement
		{ $1.elements.push($2); $$ = $1; }
	;

Assignment
	: MemberExpr ASSIGN Assignment
		{ $$ = new yy.AssignmentNode($1, $3); }
	| MemberExpr ASSIGN Expr
		{ $$ = new yy.AssignmentNode($1, $3); }
	;

FunctionDeclaration
	: FUNCTION Identifier Parameters Block
		{ $$ = new yy.FunctionDeclNode($2, $3, $4); }
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
		{ $$ = new yy.IfNode($3, $5, null); }
    | IF LPAR Expr RPAR Statement ELSE Statement
		{ $$ = new yy.IfNode($3, $5, $7); }
    ;

IterationStatement
    : WHILE LPAR Expr RPAR Statement
		{ $$ = new yy.WhileNode($3, $5); }
    | FOR LPAR
		AssignmentOrExprListOptional SEMICOLON
	  	ExprOptional SEMICOLON
		AssignmentOrExprListOptional 
		RPAR Statement
		{ $$ = new yy.ForNode($3, $5, $7, $9); }
    ;

ExprOptional
	: Expr		{ $$ = $1; }
	| %epsilon 	{ $$ = null; }
	;

AssignmentOrExprList
	: AssignmentOrExprList COMMA Assignment
		{ $1.elements.push($3); $$ = $1;}
	| AssignmentOrExprList COMMA Expr
		{ $1.elements.push($3); $$ = $1;}
	| Assignment
		{ $$ = new yy.ElementListNode();
		  $$.elements.push($1);}
	| Expr
		{ $$ = new yy.ElementListNode();
		  $$.elements.push($1); }
	;

AssignmentOrExprListOptional
	: AssignmentOrExprList			{ $$ = $1; }
	| %epsilon						{ $$ = new yy.ElementListNode(); }
	;

ReturnStatement
	: RETURN SEMICOLON				{ $$ = new yy.ReturnNode(null); }
	| RETURN Expr SEMICOLON			{ $$ = new yy.ReturnNode($2); }
	;

ContinueStatement
    : CONTINUE SEMICOLON			{ $$ = new yy.ContinueNode(); }
    ;

BreakStatement
    : BREAK SEMICOLON				{ $$ = new yy.BreakNode(); }
    ;

ClassDefinition
	: CLASS Identifier ClassBlock	{ $$ = new yy.ClassDeclNode($2, $3); }
	;

ClassBlock
	: LCURLY RCURLY
		{ $$ = new yy.ClassBodyNode(); }
	| LCURLY InClassStatementList RCURLY
		{ $$ = $2; }
	;

InClassStatementList
	: InClassStatementList InClassStatement
		{ $1.elements.push($2); $$ = $1; }
	| InClassStatement
		{ $$ = new yy.ClassBodyNode();
		  $$.elements.push($1); }
	;

InClassStatement
	: FunctionDeclaration			{ $$ = $1; }
	| Assignment SEMICOLON			{ $$ = $1; }
	;
