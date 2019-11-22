import * as React from 'react'
import { connect } from 'react-redux'
import { State } from '../types/redux'
import { LoadState } from '../types/storage'
import MainTextArea from './text-area/main-text-area'

interface MainSectionProps {
  loadState: LoadState
}

const MainSection: React.SFC<MainSectionProps> = (props) => {
  let mainArea: React.ReactNode
  if (props.loadState === LoadState.LOADED) {
    mainArea = <MainTextArea />
  } else {
    mainArea = <div>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      {mainArea}
    </div>
  )
}

export default connect(
  (state: State) => ({
    loadState: state.storage.loadState,
  })
)(MainSection)
