import { useEffect, useState } from 'react'

interface Balance {
  address: string
  drops: number
  xrp: number
  usd: number
}

export default function Dashboard() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const addr = await (window as any).keychain.get('agent_address')
      setAddress(addr || '')
      try {
        const res = await fetch('http://localhost:7373/balance', {
          headers: { Authorization: `Bearer ${process.env.WALLET_API_TOKEN || 'dev-token'}` }
        })
        const data = await res.json()
        setBalance(data)
      } catch {
        // Wallet API not ready yet
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function copy() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">X</div>
          <span className="text-white font-black text-base">UseXRP Wallet</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Balance */}
      <div className="border border-zinc-800 rounded-2xl p-6 mb-4 bg-zinc-950/60">
        <p className="text-xs font-mono text-zinc-500 mb-2">AGENT BALANCE</p>
        {loading ? (
          <div className="h-10 bg-zinc-900 rounded animate-pulse" />
        ) : (
          <>
            <p className="text-4xl font-black text-white tabular-nums">
              {balance ? balance.drops.toLocaleString() : '—'}
              <span className="text-zinc-500 text-lg font-normal ml-2">drops</span>
            </p>
            {balance && (
              <p className="text-zinc-600 text-xs font-mono mt-1">
                {balance.xrp.toFixed(6)} XRP · ${balance.usd.toFixed(4)} USD
              </p>
            )}
          </>
        )}
      </div>

      {/* Address */}
      <div className="border border-zinc-800 rounded-2xl p-5 mb-4 bg-zinc-950/60">
        <p className="text-xs font-mono text-zinc-500 mb-2">AGENT WALLET ADDRESS</p>
        <p className="text-blue-400 font-mono text-xs break-all mb-3">{address || '—'}</p>
        <button
          onClick={copy}
          className="text-xs font-mono border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {copied ? 'COPIED' : 'COPY ADDRESS'}
        </button>
      </div>

      {/* API Status */}
      <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/60">
        <p className="text-xs font-mono text-zinc-500 mb-2">OPENCLAW API</p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <p className="text-green-400 text-xs font-mono">localhost:7373 — READY</p>
        </div>
        <p className="text-zinc-700 text-xs font-mono mt-2">OpenClaw can now call the wallet API</p>
      </div>
    </div>
  )
}
