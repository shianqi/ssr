import React from 'react'
import { useSelector } from 'react-redux'

const App = () => {
  const mode = useSelector((state: any) => state.app.mode)

  return <h1>Home, {mode}</h1>
}

export default App
