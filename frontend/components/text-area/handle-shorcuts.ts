import * as React from 'react'
import { addSignAfterCursor, Direction, moveCursor, newlineAfterCursor, removeAfterCursor } from '~/frontend/actions/editor'
import { Sign } from '~/frontend/types/editor'

interface HandleShorcutsCallbacks {
  addSignAfterCursor: typeof addSignAfterCursor
  moveCursor: typeof moveCursor
  removeAfterCursor: typeof removeAfterCursor
  newlineAfterCursor: typeof newlineAfterCursor
}

// Returns true if an event caused an action.
function HandleShorcuts(e: React.KeyboardEvent, clbks: HandleShorcutsCallbacks)
  : boolean {
  // Handle combos

  // Single keys or Shift+key
  if (e.altKey || e.ctrlKey || e.metaKey) {
    return false
  }

  // Letters (convert all to uppercase)
  if (/^[A-Za-z]$/.test(e.key)) {
    clbks.addSignAfterCursor(Sign[e.key.toUpperCase() as (keyof typeof Sign)])
    return true
  }

  // Numbers
  if (/^[0-9]$/.test(e.key)) {
    clbks.addSignAfterCursor(Sign[`D${e.key}` as (keyof typeof Sign)])
    return true
  }

  // Equalities
  let sign: Sign | null = null
  switch (e.key) {
    case '_':
      sign = Sign._; break
    case '<':
      sign = Sign.LT; break
    case '>':
      sign = Sign.GT; break
    // Parentheses
    case '(':
      sign = Sign.LPAR; break
    case ')':
      sign = Sign.RPAR; break
    case '[':
      sign = Sign.LBRA; break
    case ']':
      sign = Sign.RBRA; break
    case '{':
      sign = Sign.LCURLY; break
    case '}':
      sign = Sign.RCURLY; break
    // Arithmetics
    case '+':
      sign = Sign.PLUS; break
    case '-':
      sign = Sign.MINUS; break
    case '*':
      sign = Sign.MUL; break
    case '/':
      sign = Sign.DIV; break
    case '%':
      sign = Sign.MOD; break
    // Random
    case '=':
      sign = Sign.ASSIGN; break
    case ';':
      sign = Sign.SEMICOLON; break
    case ' ':
      // Prevents scrolling to the bottom.
      e.preventDefault()
      sign = Sign.SPACE; break
    case '.':
      sign = Sign.PROP; break
    case '"':
      sign = Sign.QUOTE; break
    case ',':
      sign = Sign.COMMA; break
    // Boolean
    case '!':
      sign = Sign.NOT; break
    case '|':
      sign = Sign.OR; break
    case '&':
      sign = Sign.AND; break
  }

  if (sign !== null) {
    clbks.addSignAfterCursor(sign)
    return true
  }

  // Directions
  let direction = null
  if (e.key === 'ArrowRight') {
    direction = Direction.RIGHT
  } else if (e.key === 'ArrowDown') {
    direction = Direction.DOWN
  } else if (e.key === 'ArrowLeft') {
    direction = Direction.LEFT
  } else if (e.key === 'ArrowUp') {
    direction = Direction.UP
  }
  if (direction !== null) {
    // Prevents native scrolling 
    e.preventDefault()
    clbks.moveCursor(direction)
    return true
  }

  // Deletions
  if (e.key === 'Delete') {
    clbks.removeAfterCursor()
    return true
  } else if (e.key === 'Backspace') {
    clbks.moveCursor(Direction.LEFT)
    clbks.removeAfterCursor()
    return true
  }

  // Newline
  if (e.key === 'Enter') {
    clbks.newlineAfterCursor()
    return true
  }
  console.log(e.key)
  return false
}

export { HandleShorcuts }

