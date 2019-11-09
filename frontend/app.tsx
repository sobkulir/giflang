import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Layout } from './components/layout'
import './global.scss'
import { configureStore } from './redux/configure-store'

const store = configureStore()
ReactDOM.render(
    <Provider store={store}>
        <Layout />
    </Provider>,
    document.getElementById('root')
)
