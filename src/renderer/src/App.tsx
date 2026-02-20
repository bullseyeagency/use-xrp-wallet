import { useEffect, useState } from 'react'
import Setup from './screens/Setup'
import Unlock from './screens/Unlock'
import Dashboard from './screens/Dashboard'

type Screen = 'loading' | 'setup' | 'unlock' | 'dashboard'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')

  useEffect(() => {
    async function init() {
      const seed = await (window as any).keychain.get('agent_seed')
      if (!seed) {
        setScreen('setup')
      } else {
        setScreen('unlock')
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

  if (screen === 'setup') return <Setup onComplete={() => setScreen('dashboard')} />
  if (screen === 'unlock') return <Unlock onUnlock={() => setScreen('dashboard')} />
  return <Dashboard />
}
