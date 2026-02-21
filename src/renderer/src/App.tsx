import { useEffect, useState, Component, type ReactNode } from 'react'
import Setup from './screens/Setup'
import Unlock from './screens/Unlock'
import Dashboard from './screens/Dashboard'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-red-400 font-mono text-xs text-center">{this.state.error}</p>
          <button onClick={() => this.setState({ error: null })} className="text-xs font-mono text-zinc-500 border border-zinc-800 rounded-lg px-3 py-1.5">RETRY</button>
        </div>
      )
    }
    return this.props.children
  }
}

type Screen = 'loading' | 'setup' | 'unlock' | 'dashboard'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')

  useEffect(() => {
    async function init() {
      try {
        const seed = await (window as any).keychain.get('agent_seed')
        if (!seed) {
          setScreen('setup')
        } else {
          setScreen('unlock')
        }
      } catch {
        setScreen('setup')
      }
    }
    init()
  }, [])

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      </div>
    )
  }

  if (screen === 'setup') return <ErrorBoundary><Setup onComplete={() => setScreen('dashboard')} /></ErrorBoundary>
  if (screen === 'unlock') return <ErrorBoundary><Unlock onUnlock={() => setScreen('dashboard')} /></ErrorBoundary>
  return <ErrorBoundary><Dashboard /></ErrorBoundary>
}
