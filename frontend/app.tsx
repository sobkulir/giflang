import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Editor from './components/editor'
import './global.scss'
import { configureStore } from './redux/configureStore'

const store = configureStore()
ReactDOM.render(
    <Provider store={store}>
        <Editor />
    </Provider>,
    document.getElementById('root')
)
