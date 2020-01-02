%lex

%x comment

DIGIT       [0-9]
LETTER      [A-Z_✓☐✕αβγδεζηθικλμ]

KEYWORDS                    [<≤=≠≥>#+\-*/%˜|∧≔☐()\[\]{}☝☞⟳♶⚛ƒ⚹⚺⚻;.→,]

%%

"<"                         { return 'LT' }
"≤"                         { return 'LE' }
"="                         { return 'EQ' }
"≠"                         { return 'NE' }
"≥"                         { return 'GE' }
">"                         { return 'GT' }

"+"                         { return 'PLUS' }
"-"                         { return 'MINUS' }
"*"                         { return 'MUL' }
"/"                         { return 'DIV' }
"%"                         { return 'MOD' }

"˜"                         { return 'NOT' }
"|"                         { return 'OR' }
"∧"                         { return 'AND' }

"≔"                         { return 'ASSIGN' }

"("                         { return 'LPAR' }
")"                         { return 'RPAR' }
"["                         { return 'LBRA' }
"]"                         { return 'RBRA' }
"{"                         { return 'LCURLY' }
"}"                         { return 'RCURLY' }

"☝"                        { return 'IF' }
"☞"                        { return 'ELSE' }
"⟳"                        { return 'WHILE' }
"♶"                        { return 'FOR' }

"⚛"                         { return 'CLASS' }
"ƒ"                         { return 'FUNCTION' }
"⚹"                         { return 'RETURN' }
"⚺"                         { return 'CONTINUE' }
"⚻"                         { return 'BREAK' }

";"                         { return 'SEMICOLON' }
"."                         { return 'DOT' }
"→"                         { return 'PROP' }
","                         { return 'COMMA' }
"#"                         { this.begin('comment') }
<comment>[^\n]*\n           { this.popState() }

\"({KEYWORDS}|{LETTER}|{DIGIT}|[ \n])*\"
                            { yytext = yytext.substr(1, yytext.length - 2); return 'STRING' }

{DIGIT}+("."{DIGIT}+)?      { return 'NUMBER' }
{LETTER}({LETTER}|{DIGIT})* { return 'IDENTIFIER' }


\s+                         /* ignore whitespace */
<INITIAL,comment>.         { throw new Error(`Unknown char "${yytext}"`) }
<<EOF>>                     { return 'EOF' }

%%

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
    : Primitives EOF                { return new yy.Stmt.ProgramStmt($1, @$) }
    ;

Primitives
    : Primitives Statement          { $1.push($2); $$ = $1 }
    | Primitives ClassDefinition    { $1.push($2); $$ = $1 }
    | %epsilon                      { $$ = [] }
    ;

PrimaryComnon
    : IDENTIFIER                    { $$ = new yy.Expr.VariableRefExpr($1, @$) }
    | LPAR Expr RPAR                { $$ = $2 }
    | ArrayLiteral                  { $$ = $1 }
    | Literal                       { $$ = $1 }
    | FunctionDeclarationAnonymous  { $$ = $1 }
    ;

Literal
    : NUMBER                      { $$ = new yy.Expr.NumberValueExpr($1, @$) }
    | STRING                    { $$ = new yy.Expr.StringValueExpr($1, @$) }
    ;

ArrayLiteral
    : LBRA ElementList RBRA     { $$ = new yy.Expr.ArrayValueExpr($2, @$) }
    | LBRA RBRA                 { $$ = new yy.Expr.ArrayValueExpr([], @$) }
    ;

ElementList
    : Expr                      { $$ = [$1] }
    | ElementList COMMA Expr    { $1.push($3); $$ = $1 }
    ;

MemberExpr
    : MemberExpr PROP IDENTIFIER    { $$ = new yy.Expr.DotAccessorRefExpr($1, $3, @$) }
    | MemberExpr LBRA Expr RBRA     { $$ = new yy.Expr.SquareAccessorRefExpr($1, $3, @$) }
    | PrimaryComnon                 { $$ = $1 }
    ;

CallExpr
    : MemberExpr Arguments      { $$ = new yy.Expr.CallValueExpr($1, $2, @$) }
    | CallExpr Arguments        { $$ = new yy.Expr.CallValueExpr($1, $2, @$) }
    | CallExpr PROP IDENTIFIER  { $$ = new yy.Expr.DotAccessorRefExpr($1, $3, @$) }
    | CallExpr LBRA Expr RBRA   { $$ = new yy.Expr.SquareAccessorRefExpr($1, $3, @$) }
    ;

Arguments
    : LPAR RPAR                 { $$ = [] }
    | LPAR ElementList RPAR     { $$ = $2 }
    ;

PrimaryExpr
    : CallExpr                  { $$ = $1 }
    | MemberExpr                { $$ = $1 }
    ;
    
UnaryExpr
    : PLUS UnaryExpr            { $$ = new yy.Expr.UnaryPlusMinusValueExpr(yy.Operator.PLUS, $2, @$) }
    | MINUS UnaryExpr           { $$ = new yy.Expr.UnaryPlusMinusValueExpr(yy.Operator.MINUS, $2, @$) }
    | NOT UnaryExpr             { $$ = new yy.Expr.UnaryNotValueExpr($2, @$) }
    | PrimaryExpr               { $$ = $1 }
    ;

BinaryExpr
    : BinaryExpr MUL BinaryExpr     { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.MUL, $1, $3, @$) }
    | BinaryExpr DIV BinaryExpr     { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.DIV, $1, $3, @$) }
    | BinaryExpr MOD BinaryExpr     { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.MOD, $1, $3, @$) }

    | BinaryExpr PLUS BinaryExpr    { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.PLUS, $1, $3, @$) }
    | BinaryExpr MINUS BinaryExpr   { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.MINUS, $1, $3, @$) }

    | BinaryExpr LT BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.LT, $1, $3, @$) }
    | BinaryExpr LE BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.LE, $1, $3, @$) }
    | BinaryExpr GE BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.GE, $1, $3, @$) }
    | BinaryExpr GT BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.GT, $1, $3, @$) }

    | BinaryExpr EQ BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.EQ, $1, $3, @$) }
    | BinaryExpr NE BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.NE, $1, $3, @$) }

    | BinaryExpr AND BinaryExpr     { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.AND, $1, $3, @$) }
    | BinaryExpr OR BinaryExpr      { $$ = new yy.Expr.BinaryValueExpr(yy.Operator.OR, $1, $3, @$) }
    | UnaryExpr                     { $$ = $1 }
    ;

Expr
    : PrimaryExpr ASSIGN Expr       { 
                                      if ($1 instanceof yy.Expr.VariableRefExpr
                                        || $1 instanceof yy.Expr.DotAccessorRefExpr
                                        || $1 instanceof yy.Expr.SquareAccessorRefExpr) {
                                        $$ = new yy.Expr.AssignmentValueExpr($1, $3, @$)
                                      } else {
                                        // TODO: Update this when working on error reporting.
                                        throw new Error('TODO: Cannot assign to non-lvalue type.')
                                        YYABORT;
                                      }
                                    }
    | BinaryExpr                    { $$ = $1 }
    ;

Statement
    : Block                         { $$ = $1 }
    | Expr SEMICOLON                { $$ = new yy.Stmt.ExprStmt($1, @$) }
    | FunctionDeclaration           { $$ = new yy.Stmt.ExprStmt($1, @$) }
    | /* Empty statement */ SEMICOLON
                                    { $$ = new yy.Stmt.EmptyStmt(@$) }
    | IfStatement                   { $$ = $1  }
    | IterationStatement            { $$ = $1  }
    | ReturnStatement SEMICOLON     { $$ = $1  }
    | ContinueStatement	SEMICOLON   { $$ = $1  }
    | BreakStatement SEMICOLON      { $$ = $1  }
    ;

Block
    : LCURLY RCURLY                 { $$ = new yy.Stmt.BlockStmt([], @$) }
    | LCURLY StatementList RCURLY   { $$ = new yy.Stmt.BlockStmt($2, @$) }
    ;

StatementList
    : Statement                     { $$ = [$1] }
    | StatementList Statement       { $1.push($2); $$ = $1 }
    ;

FunctionDeclaration
    : FUNCTION IDENTIFIER Parameters Block
                                    { $$ = new yy.Expr.FunctionDeclExpr($2, $3, $4, @$) }
    ;

FunctionDeclarationAnonymous
    : FUNCTION Parameters Block
                                    { $$ = new yy.Expr.FunctionDeclExpr(/* name = */ null, $2, $3, @$) }
    ;

Parameters
    : LPAR IdentifierList RPAR      { $$ = $2 }
    | LPAR RPAR	                    { $$ = [] }
    ;

IdentifierList
    : IDENTIFIER                    { $$ = [$1] }
    | IdentifierList COMMA IDENTIFIER
                                    { $1.push($3); $$ = $1 }
    ;

IfStatement
    : IF LPAR Expr RPAR Statement %prec IF_WITHOUT_ELSE
                                    { $$ = new yy.Stmt.IfStmt($3, $5, null, @$) }
    | IF LPAR Expr RPAR Statement ELSE Statement
                                    { $$ = new yy.Stmt.IfStmt($3, $5, $7, @$) }
    ;

IterationStatement
    : WHILE LPAR Expr RPAR Statement
                                    { $$ = new yy.Stmt.WhileStmt($3, $5, @$) }
    | FOR LPAR
        ExprListOptional SEMICOLON
          ExprOptional SEMICOLON
        ExprListOptional 
        RPAR Statement              { $$ = new yy.Stmt.ForStmt($3, $5, $7, $9, @$) }
    ;

ExprOptional
    : Expr                          { $$ = $1 }
    | %epsilon                      { $$ = null }
    ;

ExprList
    : ExprList COMMA Expr           { $1.push($3); $$ = $1 }
    | Expr                          { $$ = [$1] }
    ;

ExprListOptional
    : ExprList                      { $$ = $1 }
    | %epsilon                      { $$ = [] }
    ;

ReturnStatement
    : RETURN                        { $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.RETURN, null, @$) }
    | RETURN Expr                   { $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.RETURN, $2, @$) }
    ;

ContinueStatement
    : CONTINUE                      { $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.CONTINUE, null, @$) }
    ;

BreakStatement
    : BREAK                         { $$ = new yy.Stmt.CompletionStmt(yy.CompletionType.BREAK, null, @$) }
    ;

ClassDefinition
    : CLASS IDENTIFIER ClassBlock   { $$ = new yy.Stmt.ClassDefStmt($2, null, $3, @$) }
    | CLASS IDENTIFIER LPAR IDENTIFIER RPAR ClassBlock	
                                    { $$ = new yy.Stmt.ClassDefStmt($2, $4, $6, @$) }
    ;

ClassBlock
    : LCURLY RCURLY                 { $$ = [] }
    | LCURLY ClassMethodList RCURLY
                                    { $$ = $2 }
    ;

ClassMethodList
    : ClassMethodList FunctionDeclaration
                                    { $$ = $1.concat($2) }
    | FunctionDeclaration
                                    { $$ = [$1] }
    ;

%%
