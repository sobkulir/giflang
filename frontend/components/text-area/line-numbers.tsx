import React from 'react'

interface LineNumbersProps {
  textRowCount: number
}

export const LineNumbers: React.SFC<LineNumbersProps> = (props) => {
  const getStyles = (): React.CSSProperties => ({
    width: '80px',
    height: '400px'
  })

  return (
    <div style={getStyles()}>
      >
  </div>
  )
}
