import * as firebase from 'firebase'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Layout } from './components/layout'
import FirebaseConfig from './firebase/config'
import './global.scss'
import { configureStore } from './redux/configure-store'

export const storeInstance = configureStore()

// Initialize Firebase
firebase.initializeApp(FirebaseConfig)

ReactDOM.render(
    <Provider store={storeInstance}>
        <Layout />
    </Provider>,
    document.getElementById('root')
)
