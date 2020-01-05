import * as React from 'react'
import { addLineToInput } from '~/frontend/actions/execution'
import { addSignAfterCursor, Direction, moveCursor, newlineAfterCursor, removeAfterCursor } from '~/frontend/actions/text-area'
import { TextAreaType } from '~/frontend/types/text-area'
import { Sign } from '~/interpreter/ast/sign'

interface HandleCommonCallbacks {
  addSignAfterCursor: typeof addSignAfterCursor
  moveCursor: typeof moveCursor
  removeAfterCursor: typeof removeAfterCursor
}

interface HandleExecutionInputCallbacks extends HandleCommonCallbacks {
  addLineToInput: typeof addLineToInput
}

interface HandleMainEditorCallbacks extends HandleCommonCallbacks {
  newlineAfterCursor: typeof newlineAfterCursor
}

function HandleCommon(
  areaType: TextAreaType,
  e: React.KeyboardEvent, clbks: HandleCommonCallbacks
) {
  // Single keys or Shift+key
  if (e.altKey || e.ctrlKey || e.metaKey) {
    return false
  }

  // Letters (convert all to uppercase)
  if (/^[A-Za-z]$/.test(e.key)) {
    clbks.addSignAfterCursor(
      areaType, Sign[e.key.toUpperCase() as (keyof typeof Sign)])
    return true
  }

  // Numbers
  if (/^[0-9]$/.test(e.key)) {
    clbks.addSignAfterCursor(
      areaType, Sign[`D${e.key}` as (keyof typeof Sign)])
    return true
  }

  let sign: Sign | null = null
  switch (e.key) {
    case '_':
      sign = Sign._; break
    case ' ':
      // Prevents scrolling to the bottom.
      e.preventDefault()
      sign = Sign.SPACE; break
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
    case '.':
      sign = Sign.PROP; break
    case `'`:
      sign = Sign.QUOTE; break
    case ',':
      sign = Sign.COMMA; break
    case '#':
      sign = Sign.COMMENT; break
    // Boolean
    case '!':
      sign = Sign.NOT; break
    case '|':
      sign = Sign.OR; break
    case '&':
      sign = Sign.AND; break
  }

  if (sign !== null) {
    clbks.addSignAfterCursor(areaType, sign)
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
    clbks.moveCursor(areaType, direction)
    return true
  }

  // Deletions
  if (e.key === 'Delete') {
    clbks.removeAfterCursor(areaType)
    return true
  } else if (e.key === 'Backspace') {
    clbks.moveCursor(areaType, Direction.LEFT)
    clbks.removeAfterCursor(areaType)
    return true
  }

  return false
}

export function HandleExecutionInputShortcuts(
  e: React.KeyboardEvent, clbks: HandleExecutionInputCallbacks)
  : boolean {
  const areaType = TextAreaType.EXECUTION_INPUT
  if (HandleCommon(areaType, e, clbks)) return true

  // Commit input
  if (e.key === 'Enter') {
    clbks.addLineToInput()
    return true
  }
  return false
}

// Returns true if an event caused an action.
export function HandleMainEditorShortcuts(
  e: React.KeyboardEvent, clbks: HandleMainEditorCallbacks)
  : boolean {
  const areaType = TextAreaType.MAIN_EDITOR

  if (HandleCommon(areaType, e, clbks)) return true

  // Newline
  if (e.key === 'Enter') {
    clbks.newlineAfterCursor(areaType)
    return true
  }
  return false
}
