import { useState } from 'react'

export default function Unlock({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function unlock() {
    const seed = await (window as any).keychain.get('agent_seed')
    if (seed) {
      onUnlock()
    } else {
      setError('Wallet not found')
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl mb-6">X</div>
      <h1 className="text-xl font-black text-white mb-1">UseXRP Wallet</h1>
      <p className="text-zinc-600 text-xs font-mono mb-8">Enter password to unlock</p>
      <div className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && unlock()}
          placeholder="Password"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500 text-center"
          autoFocus
        />
        {error && <p className="text-red-400 text-xs font-mono text-center">{error}</p>}
        <button onClick={unlock} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-sm transition-colors">
          UNLOCK
        </button>
      </div>
    </div>
  )
}
