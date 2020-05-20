import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'

const Client = <App />

ReactDOM.hydrate(Client, document.getElementById('app'))
