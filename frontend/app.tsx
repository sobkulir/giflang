import firebase from 'firebase/app'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router'
import Layout from './components/layout'
import FirebaseConfig from './firebase/config'
import './global.scss'
import History from './history'
import { configureStore } from './redux/configure-store'

// Initialize Firebase
firebase.initializeApp(FirebaseConfig)

export const storeInstance = configureStore()

ReactDOM.render(
    <Router history={History}>
        <Provider store={storeInstance}>
            <Route path="/:codeId([a-zA-Z0-9]*)">
                <Layout />
            </Route>
        </Provider>
    </Router>,
    document.getElementById('root')
)
