import firebase from 'firebase/app'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Router, Switch } from 'react-router'
import Docs from './components/docs'
import Layout from './components/layout'
import { configureStore } from './config/configure-store'
import FirebaseConfig from './config/firebase'
import './global.scss'
import History from './history'

// Initialize Firebase
firebase.initializeApp(FirebaseConfig)

export const storeInstance = configureStore()

ReactDOM.render(
    <Router history={History}>
        <Provider store={storeInstance}>
            <Switch>
                <Route path="/docs" exact={true}>
                    <Docs />
                </Route>
                <Route path="/:codeId?" exact={true}>
                    <Layout />
                </Route>
            </Switch>
        </Provider>
    </Router>,
    document.getElementById('root')
)
