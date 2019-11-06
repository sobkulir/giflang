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
  if (e.key === '<') {
    props.addSignAfterCursor(Sign.LT)
    return true
  } else if (e.key === '>') {
    props.addSignAfterCursor(Sign.GT)
    return true
  }

  if (e.key === '(') {
    props.addSignAfterCursor(Sign.LPAR)
    return true
  } else if (e.key === ')') {
    props.addSignAfterCursor(Sign.RPAR)
    return true
  }

  // Arithmetics
  if (e.key === '+') {
    props.addSignAfterCursor(Sign.PLUS)
    return true
  } else if (e.key === '-') {
    props.addSignAfterCursor(Sign.MINUS)
    return true
  } else if (e.key === '*') {
    props.addSignAfterCursor(Sign.MUL)
    return true
  } else if (e.key === '/') {
    props.addSignAfterCursor(Sign.DIV)
    return true
  } else if (e.key === '%') {
    props.addSignAfterCursor(Sign.MOD)
    return true
  }

  // Random
  if (e.key === ';') {
    props.addSignAfterCursor(Sign.SEMICOLON)
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

