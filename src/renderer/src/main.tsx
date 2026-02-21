import React, { Component, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { Web3AuthProvider } from '@web3auth/modal/react'
import App from './App'
import { buildWeb3AuthConfig } from './lib/web3auth'
import './globals.css'

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#000', color: '#f87171', fontFamily: 'monospace', padding: 24, minHeight: '100vh' }}>
          <p style={{ marginBottom: 8, fontSize: 11 }}>STARTUP ERROR</p>
          <p style={{ fontSize: 11, wordBreak: 'break-all' }}>{this.state.error}</p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Web3AuthProvider config={buildWeb3AuthConfig()}>
        <App />
      </Web3AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>
)
