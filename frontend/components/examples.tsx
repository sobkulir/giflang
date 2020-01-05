import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }),
)

const options = [
  {
    label: 'Fibonacci', val:
      `#PROGRAM TAKES
#A SINGLE NUMBER
#N AND PRINTS
#FIB(N)

ƒFIB(N){
 ☝(N=0)⚹0; 
 ☝(N=1)⚹1;
 ⚹FIB(N-1)
 +FIB(N-2);
}

N≔NUM(μ());
λ(FIB(N));
`
  },
  {
    label: 'FizzBuzz', val:
      `#PRINTS NUMBERS
#FROM 1 TO 100
# -FOR MULTIPLES
#  OF 3 PRINTS FIZZ
# -FOR MULTIPLES
#  OF 5 PRINTS BUZZ
# -FOR MULTIPLES
#  OF BOTH 3 AND 5
#  PRINTS FIZZBUZZ

♶(I≔1;
  I≤100;
  I≔I+1){
 κ≔(I%3=0);
 ε≔(I%5=0);
 ☝(κ∧ε)
  λ("FIZZBUZZ");
 ☞☝(κ)
  λ("FIZZ");
 ☞☝(ε)
  λ("BUZZ");
 ☞λ(I);
}
`
  },
  {
    label: 'Triangle', val:
      `#TAKES A SINGLE
#NUMBER N AND
#PRINTS A TRIANGLE
#WITH HEIGHT N

#PRINTS SYMBOL
#S M TIMES
ƒλREP(M,S){
 ♶(I≔0;
   I<M;
   I≔I+1)
  λλ(S);
}

N≔NUM(μ());
♶(I≔1;
  I≤N;
  I≔I+1){
 λREP(N-I,"☐");
 λREP(2*I-1,"ζ");
 λREP(N-I,"☐");
 λ();
}
`
  },
  {
    label: 'Edit distance', val:
      `#TAKES TWO
#STRINGS AND
#PRINTS THEIR
#EDIT DISTANCE
#(LEVENSHTEIN)

ƒMIN(X,Y){
 ☝(X<Y)⚹X;
 ☞⚹Y;
}

A≔μ();
B≔μ();
Aβ≔A→LEN()+1;
Bβ≔B→LEN()+1;

#INIT MATRIX ε
ε≔[];
♶(I≔0;
  I<Aβ;
  I≔I+1){
 ε→PUSH([]);
 ♶(J≔0;
   J<Bβ;
   J≔J+1)
  ε[I]→PUSH(0);
}

#INIT 1ST COL
♶(I≔0;
  I<Bβ;
  I≔I+1)
 ε[0][I]≔I;

#INIT 1ST ROW
♶(I≔0;
  I<Aβ;
  I≔I+1)
 ε[I][0]≔I;

♶(I≔1;
  I<Aβ;
  I≔I+1){
 ♶(J≔1;
   J<Bβ;
   J≔J+1){
  ε[I][J]≔MIN(
   ε[I-1][J],
   MIN(ε[I][J-1],
       ε[I-1][J-1])
   )+1;
  ☝(A[I-1]=B[J-1])
   ε[I][J]≔
    ε[I-1][J-1];
 }
}

λ(ε[Aβ-1][Bβ-1]);`}
]

interface ExamplesProps {
  setCode(code: string): void
}

export const ExamplesButton: React.SFC<ExamplesProps> = ({ setCode }) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick =
    (_e: React.MouseEvent<HTMLElement>, index: number) => {
      setCode(options[index].val)
      setAnchorEl(null)
    }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <span className={classes.root}>
      <Button
        onClick={handleClickListItem}
        size="small"
        variant="outlined"
        color="primary"
      >
        Examples
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted={true}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option.label}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </span>
  )
}
