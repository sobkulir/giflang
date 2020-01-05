import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { connect } from 'react-redux'
import { stringToSigns } from '../lib/text-area'
import { LetterSize, SignToGifMap } from '../types/ide'
import { State } from '../types/redux'
import { Content } from './text-area/content'

export interface DocsProps {
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

const section = (s: string) => {
  return (
    <Typography style={{ margin: '40 0 15 0' }} variant="h4">{s}</Typography>
  )
}
const subsection = (s: string) => {
  return (
    <Typography style={{ marginTop: 15 }} variant="h6">{s}</Typography>
  )
}
const Par: React.FunctionComponent = ({ children }) => {
  return (
    <Typography paragraph={true} variant="body1">{children}</Typography>
  )
}

const Docs: React.SFC<DocsProps> = (props: DocsProps) => {
  const listing = (s: string) => {
    const styles: React.CSSProperties = {
      overflow: 'auto',
      padding: '10px',
      margin: '10px 0',
      backgroundColor: 'lightgrey'
    }
    const factoredSize: LetterSize = {
      edgePx: 0.8 * props.letterSize.edgePx,
      marginPx: props.letterSize.marginPx
    }
    return (
      <div style={styles}>
        <Content
          text={stringToSigns(s)}
          letterSize={factoredSize}
          signToGifMap={props.signToGifMap}
        />
      </div>
    )
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={1} style={{ padding: '40' }} >
        <Typography style={{ paddingBottom: 20 }} variant="h2">Giflang docs</Typography>
        <Par>
          Giflang is very similar to Python as it is a dynamically-typed, object-oriented
          language with a support for magic methods. However, Giflang separates statements
          with semicolons and blocks are not delimited with indentation as in Python.
          And now, behold the Hello World example.
        </Par>
        {listing('λ("δ ε");')}
        <Par>
          Before we start describing the language constructs, let's see how comments look like. The
          image introducing a comment can be added by inputting a hashtag "#" in the IDE.
        </Par>
        {listing('#ALL COMMENTS\n#START WITH #')}

        {section('Variable names and blocks')}
        <Par>
          Valid variable names can contain English letters, digits and additionally any image from the "Letters"
          section found in the right panel in the IDE. The variable names cannot start with a digit.
        </Par>
        {listing('#OK\nVARNAME;\nι3;\nαα;\n\n#NOT OK\n+-;\n=;\n133A;')}
        <Par>
          Blocks are defined similar to C or JavaScript.
        </Par>
        {listing('{\n #BLOCK\n}')}
        <Par>
          Statements must be delimited. The delimiter can be added in the IDE by inputting a semicolon ";".
        </Par>
        {listing('#; SEMICOLON\nX≔1;\nY≔2;')}

        {section('Basic I/O')}
        <Par>
          There are 3 I/O functions in Giflang.
        </Par>
        {subsection('Input')}
        <Par>
          Input function returns a single line of input. In the example the input is assigned to
          a variable Z. Note that assignments can also be chained, in such case the resolution
          starts from the right-most assignment.
        </Par>
        {listing('#μ INPUT\nZ≔μ();')}
        {subsection('Println')}
        <Par>
          Println stringifies its arguments and prints them on a single line delimited with spaces.
        </Par>
        {listing('#λ PRINTLN\n#"1 2\n#"\nλ(1,2);')}
        {subsection('Print')}
        <Par>
          Print has the same semantics as println except for printing the newline at the end -- print omits the newline.
        </Par>
        {listing('#λλ PRINT\n#"1 2"\nλλ(1,2);')}

        {section('Built-in types')}

        {subsection('Number')}
        <Par>
          Number is a wrapper around JavaScript number (double). Basic arithmetic operations are supported
          as shown below.
        </Par>
        {listing('X≔1+2;\nY≔X*X;\nZ≔NUM("1");\n#10\nλ(Y+Z);')}
        <Par>
          Note that the third line shows how to convert a string into a number using NUM constructor. Since
          number is a double, in order to support integer division there is a floor and ceil function.
        </Par>
        {listing('#2\nX≔NUM→FLOOR(5/2);\n\n#AS METHOD\nY≔(5/2)→FLOOR();')}
        <Par>
          To define a floating-point number, there is a special image to represent the decimal point. We can
          see it in the following example.
        </Par>
        {listing('λ(3.14);')}

        {subsection('String')}
        <Par>
          String literals can be created by wrapping characters around quotes. Any character can appear
          in the string except for the quote. Currently, there is no way of escaping the quote.
        </Par>
        {listing('κ≔"HELLO";\nε≔μ();\nλ(κ,ε);')}
        <Par>
          The program gets a name as an input and prints "HELLO {'${name}'}". Strings are <i>immutable</i>. We can
          access the individual characters using brackets as shown below. The indexing starts at 0.
        </Par>
        {listing('κ≔"αζι";\n#ζα\nλ(κ[1]+\n  κ[0]);')}
        <Par>
          Additionally, strings support split and slice function. Their behaviour is identical to the JavaScript
          functions <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split">split</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice">slice</a>.
        </Par>
        {listing('κ≔"α ζ ι";\nX≔κ→SPLIT(" ");\n#[α,ζ,ι]\nλ(X);')}
        {listing('κ≔"αζι";\nX≔κ→SLICE(1,2);\n#ζ\nλ(X);')}
        <Par>
          To convert any object to string, we can call STR constructor.
        </Par>
        {listing('X≔STR(2);\n#12\nλ("1"+X);')}

        <Par>
          To get the length of the string, there is a LEN method.
        </Par>
        {listing('X≔"HELLO";\nλ(X→LEN());')}

        {subsection('Array')}
        <Par>
          Arrays are yet again wrappers around JavaScript arrays. Example below shows creation of an array literal and
          pushing and popping elements.
        </Par>
        {listing('X≔[1,2];\n\nX→PUSH(3);\n#[1,2,3]\nλ(X);\n\nX→POP();\n#[1,2]\nλ(X);')}
        <Par>
          To get the array's length we can use the LEN method.
        </Par>
        {listing('X≔[1,2];\n#2\nλ(X→LEN());')}

        {subsection('Boolean')}
        <Par>
          Booleans represent binary values, True and False. Similar to Python, Giflang has two global variables
          that represent True and False.
        </Par>
        {listing('✓ #TRUE\n✕ #FALSE')}
        <Par>
          All condition expressions are converted to Booleans using __BOOL__ magic methods (explained later). There are
          also three Boolean operators: AND, OR, NOT. They can be seen on the example below in the given order.
        </Par>
        {listing('✓∧✓; #AND\n✕|✓; #OR\n˜✕;  #NOT')}

        {subsection('None')}
        <Par>
          None represents "no value", similar to Python. It is a global variable. Functions that do not return
          any variable return None, for example print.
        </Par>
        {listing('☐; #NONE\n#☐\nλ(λλ());')}

        {section('Expressions')}
        {subsection('Comparisons')}
        <Par>
          There are following comparison operators in Giflang: {'<'}, {'<='}, {'=='}, {'!='}, {'>='}, {'>'}. The
          example below shows all of them in the same order as in the previous statement. All expressions are truthy.
        </Par>
        {listing('1<2;\n1≤2;\n2=2;\n2≠3;\n2≥1;\n2>1;')}

        {subsection('Arithmetics')}
        <Par>
          Giflang supports the following arithmetic operators: {'+'}, {'-'}, {'*'}, {'/'}, {'%'}.
        </Par>
        {listing('1+2;\n1-2;\n1*2;\n1/2;\n1%2;')}

        {section('Control Flow')}
        <Par>
          There are 3 control flow constructs: if, for, while.
        </Par>

        {subsection('If')}
        <Par>
          A simple "if"-"else if"-"else" example is shown below. The blocks could have been omitted as there
          is only a single statement in each branch.
        </Par>
        {listing('#☝ IF\n#☞ ELSE\n\nX≔2;\n☝(X=1){\n λ(1);\n}☞☝(X=2){\n λ(2);\n}☞{\n λ("ELSE");\n}\n\n#PRINTS 2')}
        <Par />

        {subsection('While')}
        <Par>
          While is traditional, it executes the block inside of it while its condition is truthy.
        </Par>
        {listing('#⟳ WHILE\n\nI≔1;\n⟳(I<5){\n λλ(I);\n I≔I+1;\n}\n\n#1234')}

        {subsection('For')}
        <Par>
          Giflang features a C-like "for". It has 3 sections: preamble that is executed only once, condition,
          and increment. They are separated with delimiters.
        </Par>
        {listing('#♶ FOR\n\n♶(I≔1;\n  I<5;\n  I≔I+1){\n λλ(I);\n}\n\n#1234')}

        {subsection('Break and continue')}
        <Par>
          It is possible to break out of a loop or skip the rest of the block inside of it using break and continue.
        </Par>
        {listing('#⚻ BREAK\n#⚺ CONTINUE\n\n♶(I≔1;\n  I<5;\n  I≔I+1){\n ☝(I=2)⚺;\n ☝(I=4)⚻;\n λλ(I);\n}\n\n#13')}

        {section('Functions')}
        <Par>
          Functions in Giflang are defined using a special image followed by a list of parameters and a function block.
        </Par>
        {listing('#ƒ FUNCTION\n#⚹ RETURN\n\nƒID(X){\n ⚹X;\n}\n\n#1\nλ(ID(1));')}
        <Par>
          Functions can appear inside other functions.
        </Par>
        {listing('ƒF(X){\n ƒG(Y){\n  λ(X+Y);\n }\n G(2);\n G(3);\n}\n\n#3#4F(1);')}
        <Par>
          There is also a support for anonymous functions that can capture values from the enclosing environment (closures).
          The captured values are resolved at time of execution of the closure. Therefore, even though Z does not exist at the
          time of creation of the closure, the program prints 3 because Z exists at the time of execution of the closure.
        </Par>
        {listing('ƒF(){\n G≔ƒ(){λ(Z);};\n Z≔3;\n G();\n}\n\n#3\nF();')}

        {section('Classes')}
        <Par>
          Classes in Giflang are very similar to Python classes. Methods take an instance they should operate on as their first arguments.
          Constructors and operator overloads are supported in the form of magic methods. New instances are created by calling the class with constructor
          arguments.
        </Par>
        {listing('#⚛ CLASS\n#→ PROPERTY\n#  ACCESS\n\n⚛C{\n ƒ__INIT__(\n  SELF,X){\n SELF→X≔X;\n }\n ƒλ(SELF){\n  λ(SELF→X);\n }\n}\n\nX≔C(8);\n#8\nX→λ();')}
        <Par>
          There are numerous magic methods that can be overloaded:
        </Par>
        <ul>
          <li><Par>__INIT__ -- constructor</Par></li>

          <li><Par>__ADD__ -- addition operator +</Par></li>
          <li><Par>__SUB__ -- subtraction operator -</Par></li>
          <li><Par>__MUL__ -- multiplication operator *</Par></li>
          <li><Par>__DIV__ -- division operator /</Par></li>
          <li><Par>__MOD__ -- modulus operator %</Par></li>

          <li><Par>__LT__ -- "less than" operator {'<'}</Par></li>
          <li><Par>__LE__ -- "less than equal" operator {'<='}</Par></li>
          <li><Par>__EQ__ -- equality operator ==</Par></li>
          <li><Par>__NE__ -- inequality operator !=</Par></li>
          <li><Par>__GE__ -- "greater than equal" operator {'>='}</Par></li>
          <li><Par>__GT__ -- "greater than" operator {'>'}</Par></li>

          <li><Par>__STR__ -- string representation (called by print or STR constructor)</Par></li>
          <li><Par>__BOOL__ -- boolean conversion (called when the instance appears in a condition</Par></li>
          <li><Par>__NEG__ -- negation operator</Par></li>
          <li><Par>__POS__ -- unary plus operator</Par></li>
          <li><Par>__CALL__ -- call operator</Par></li>
          <li><Par>__GETITEM__ -- element get operator</Par></li>
          <li><Par>__SETITEM__ -- element set operator</Par></li>
        </ul>

        <Par>Additionally, single-base inheritance is supported in Giflang.</Par>
        {listing('⚛B{\n ƒι(S){\n  λ("B→ι");\n }\n ƒκ(S){\n  λ("B→κ");\n }\n}\n\n⚛D(B){\n ƒι(S){\n  λ("D→ι");\n }\n}\n\nX≔D();\n#D→ι\nX→ι();\n#B→κ\nX→κ();')}

        <Par>
          And now, <i>happy hacking</i>!
        </Par>
      </Paper>
    </Container >
  )
}

export default connect(
  (state: State) => ({
    signToGifMap: state.ide.signToGifMap,
    letterSize: state.ide.letterSize,
  })
)(Docs)
