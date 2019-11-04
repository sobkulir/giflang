import * as React from 'react'
import { Direction } from '../redux/editor/actions'
import { Sign } from '../redux/editor/sign'
import { EditorProps } from './editor'

// Returns true if event caused an action.
function HandleShorcuts(e: React.KeyboardEvent, props: EditorProps)
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

