import React from 'react'
import ReactDOM from 'react-dom/client'
import { Web3AuthProvider } from '@web3auth/modal/react'
import App from './App'
import { buildWeb3AuthConfig } from './lib/web3auth'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Web3AuthProvider config={buildWeb3AuthConfig()}>
      <App />
    </Web3AuthProvider>
  </React.StrictMode>
)
