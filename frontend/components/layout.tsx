import * as React from 'react'
import { useParams } from 'react-router'
import IOBox from './io-box/io-box'
import * as styles from './layout.scss'
import LetterPicker from './letter-picker'
import Menu from './menu'
import MainTextArea from './text-area/main-text-area'

export default () => {
  const match = useParams<{ codeId: string }>()
  console.log(match)

  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.header}>
        <Menu />
      </div>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <MainTextArea />
          <IOBox />
        </div>
        <LetterPicker />
      </div>
    </div>
  )
} 
