import * as React from 'react'
import { Sign } from '../lib/sign'
import { Direction } from '../redux/editor/actions'
import { TextAreaProps } from './text-area'

// Returns true if event caused an action.
function HandleShorcuts(e: React.KeyboardEvent, props: TextAreaProps)
  : boolean {
  // Handle combos

  // Single keys or Shift+key
  if (e.altKey || e.ctrlKey || e.metaKey) {
    return false
  }

  // Letters
  if (/^[A-Za-z]$/.test(e.key)) {
    props.addSignAfterCursor(Sign[e.key as (keyof typeof Sign)])
    return true
  }

  // Numbers
  if (/^[0-9]$/.test(e.key)) {
    props.addSignAfterCursor(Sign[`N${e.key}` as (keyof typeof Sign)])
    return true
  }

  // Equalities
  let sign: Sign | null = null
  switch (e.key) {
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
    props.addSignAfterCursor(sign)
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
    props.moveCursor(direction)
    return true
  }

  // Deletions
  if (e.key === 'Delete') {
    props.removeAfterCursor()
    return true
  } else if (e.key === 'Backspace') {
    props.moveCursor(Direction.LEFT)
    props.removeAfterCursor()
    return true
  }

  // Newline
  if (e.key === 'Enter') {
    props.newlineAfterCursor()
    return true
  }
  console.log(e.key)
  return false
}

export { HandleShorcuts }

