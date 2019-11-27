import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import LoadingBar from 'react-top-loading-bar'
import { setLoadingBarState } from '../actions/loading-bar'
import { loadCode } from '../actions/storage'
import { isDebugMode, RunState } from '../types/execution'
import { LoadingBarState } from '../types/ide'
import { State, ThunkActionDispatch } from '../types/redux'
import { LoadState } from '../types/storage'
import DebugBox from './debug-box'
import IOBox from './io-box/io-box'
import * as styles from './layout.scss'
import LetterPicker from './letter-picker'
import MainSection from './main-section'
import Menu from './menu'

interface LayoutProps extends RouteComponentProps<{ codeId: string }> {
  runState: RunState
  loadState: LoadState
  loadingBarState: LoadingBarState
  loadCode: ThunkActionDispatch<typeof loadCode>
  setLoadingBarState: typeof setLoadingBarState
}

class Layout extends React.PureComponent<LayoutProps> {
  readonly loadingBarRef: React.RefObject<any>
  constructor(props: LayoutProps) {
    super(props)
    this.loadingBarRef = React.createRef()
    if (props.loadState === LoadState.INITIAL) {
      props.loadCode(props.match.params.codeId)
    }
  }

  componentDidUpdate() {
    switch (this.props.loadingBarState) {
      case LoadingBarState.START:
        this.loadingBarRef.current!.continuousStart()
        this.props.setLoadingBarState(LoadingBarState.IN_PROGRESS)
        break
      case LoadingBarState.COMPLETE:
        this.loadingBarRef.current!.complete()
        this.props.setLoadingBarState(LoadingBarState.IDLE)
    }
  }

  render() {
    return (
      <div className={styles.layoutWrapper} >
        <LoadingBar ref={this.loadingBarRef} />
        <div className={styles.header}>
          <Menu />
        </div>
        <div className={styles.content}>
          <div className={styles.leftContent}>
            <MainSection />
            <IOBox />
          </div>
          {isDebugMode(this.props.runState) ? <DebugBox /> : <LetterPicker />}
        </div>
      </div >
    )
  }
}

export default withRouter(connect(
  (state: State) => ({
    runState: state.execution.runState,
    loadState: state.storage.loadState,
    loadingBarState: state.ide.loadingBarState
  }),
  {
    loadCode,
    setLoadingBarState
  }
)(Layout))
