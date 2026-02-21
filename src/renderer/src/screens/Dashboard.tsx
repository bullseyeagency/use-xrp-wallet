import { useEffect, useState } from 'react'
import { useWeb3Auth } from '@web3auth/modal/react'
import { useWeb3AuthConnect } from '@web3auth/modal/react'
import { useWeb3AuthDisconnect } from '@web3auth/modal/react'
import { getXrplAddressFromProvider } from '../lib/web3auth'
import { WEB3AUTH_CLIENT_ID } from '../lib/config'

interface Balance {
  address: string
  drops: number
  xrp: number
  usd: number
  activated: boolean
}

type ApiStatus = 'checking' | 'ready' | 'error'

export default function Dashboard() {
  // Agent wallet
  const [balance, setBalance] = useState<Balance | null>(null)
  const [agentAddress, setAgentAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [agentCopied, setAgentCopied] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [fauceting, setFauceting] = useState(false)

  // Human wallet — Web3Auth v10 hooks
  const { provider } = useWeb3Auth()
  const { connect, isConnected, loading: humanLoading } = useWeb3AuthConnect()
  const { disconnect } = useWeb3AuthDisconnect()
  const [humanAddress, setHumanAddress] = useState<string | null>(null)
  const [humanCopied, setHumanCopied] = useState(false)

  async function loadBalance() {
    try {
      const res = await fetch('http://localhost:7373/balance', {
        headers: { Authorization: `Bearer dev-token` },
      })
      if (res.ok) {
        const data = await res.json()
        setBalance(data)
        setApiStatus('ready')
      } else {
        setApiStatus('error')
      }
    } catch {
      setApiStatus('error')
    }
  }

  // Load agent wallet data
  useEffect(() => {
    async function load() {
      const addr = await (window as any).keychain.get('agent_address')
      setAgentAddress(addr || '')
      await loadBalance()
      setLoading(false)
    }
    load()
  }, [])

  async function requestFaucet() {
    setFauceting(true)
    try {
      await fetch('http://localhost:7373/faucet', {
        method: 'POST',
        headers: { Authorization: `Bearer dev-token` },
      })
      // Wait a few seconds for the ledger to settle then refresh
      await new Promise(r => setTimeout(r, 4000))
      await loadBalance()
    } catch {}
    setFauceting(false)
  }

  // Resolve XRPL address once provider is available
  useEffect(() => {
    if (isConnected && provider) {
      getXrplAddressFromProvider(provider).then(addr => {
        if (addr) setHumanAddress(addr)
      })
    } else {
      setHumanAddress(null)
    }
  }, [isConnected, provider])

  async function connectHumanWallet() {
    try {
      await connect({ mfaLevel: 'none' } as any)
    } catch (err) {
      console.error('Connect error:', err)
    }
  }

  async function disconnectHumanWallet() {
    try {
      await disconnect()
    } catch {}
  }

  function copyAgent() {
    navigator.clipboard.writeText(agentAddress)
    setAgentCopied(true)
    setTimeout(() => setAgentCopied(false), 1500)
  }

  function copyHuman() {
    navigator.clipboard.writeText(humanAddress!)
    setHumanCopied(true)
    setTimeout(() => setHumanCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 pt-12 pb-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">X</div>
          <span className="text-white font-black text-base">UseXRP Wallet</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          TESTNET
        </div>
      </div>

      {/* ── AGENT WALLET ── */}
      <p className="text-xs font-mono text-zinc-600 mb-3 tracking-widest">AGENT WALLET</p>

      {/* Balance */}
      <div className="border border-zinc-800 rounded-2xl p-5 mb-3 bg-zinc-950/60">
        <p className="text-xs font-mono text-zinc-500 mb-2">BALANCE</p>
        {loading ? (
          <div className="h-9 bg-zinc-900 rounded animate-pulse" />
        ) : (
          <>
            <p className="text-3xl font-black text-white tabular-nums">
              {balance ? balance.drops.toLocaleString() : '—'}
              <span className="text-zinc-500 text-base font-normal ml-2">drops</span>
            </p>
            {balance && (
              <p className="text-zinc-600 text-xs font-mono mt-1">
                {balance.xrp.toFixed(6)} XRP · ${balance.usd.toFixed(4)}
              </p>
            )}
          </>
        )}
      </div>

      {/* Faucet — testnet only, unfunded wallet */}
      {balance && !balance.activated && (
        <div className="border border-yellow-800/40 rounded-2xl p-4 mb-3 bg-zinc-950/60">
          <p className="text-yellow-400 text-xs font-mono mb-3">WALLET NOT ACTIVATED — needs 10 XRP reserve</p>
          <button
            onClick={requestFaucet}
            disabled={fauceting}
            className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs transition-colors"
          >
            {fauceting ? 'REQUESTING TESTNET XRP...' : 'REQUEST FROM TESTNET FAUCET'}
          </button>
        </div>
      )}

      {/* Agent address */}
      <div className="border border-zinc-800 rounded-2xl p-5 mb-3 bg-zinc-950/60">
        <p className="text-xs font-mono text-zinc-500 mb-2">ADDRESS</p>
        <p className="text-blue-400 font-mono text-xs break-all mb-3">{agentAddress || '—'}</p>
        <button
          onClick={copyAgent}
          className="text-xs font-mono border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {agentCopied ? 'COPIED' : 'COPY'}
        </button>
      </div>

      {/* API status */}
      <div className="border border-zinc-800 rounded-2xl p-4 mb-8 bg-zinc-950/60">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-zinc-500">OPENCLAW API</p>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === 'ready' ? 'bg-green-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <p className={`text-xs font-mono ${apiStatus === 'ready' ? 'text-green-400' : 'text-red-400'}`}>
              {apiStatus === 'ready' ? 'localhost:7373' : apiStatus === 'error' ? 'UNAVAILABLE' : 'CHECKING...'}
            </p>
          </div>
        </div>
      </div>

      {/* ── HUMAN WALLET ── */}
      <p className="text-xs font-mono text-zinc-600 mb-3 tracking-widest">HUMAN WALLET</p>

      {!WEB3AUTH_CLIENT_ID ? (
        <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/60">
          <p className="text-zinc-500 text-xs font-mono mb-1">Web3Auth Client ID not configured.</p>
          <p className="text-zinc-700 text-xs font-mono mb-4">Set VITE_WEB3AUTH_CLIENT_ID in .env</p>
          <a
            href="https://dashboard.web3auth.io"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-blue-400 hover:text-blue-300 border border-zinc-800 hover:border-zinc-600 rounded-lg px-3 py-1.5 transition-colors"
          >
            GET CLIENT ID →
          </a>
        </div>
      ) : isConnected && humanAddress ? (
        <div className="border border-purple-800/40 rounded-2xl p-5 bg-zinc-950/60">
          <p className="text-xs font-mono text-zinc-500 mb-2">ADDRESS</p>
          <p className="text-purple-400 font-mono text-xs break-all mb-3">{humanAddress}</p>
          <div className="flex gap-2">
            <button
              onClick={copyHuman}
              className="text-xs font-mono border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              {humanCopied ? 'COPIED' : 'COPY'}
            </button>
            <button
              onClick={disconnectHumanWallet}
              className="text-xs font-mono border border-zinc-700 hover:border-red-800 text-zinc-600 hover:text-red-400 rounded-lg px-3 py-1.5 transition-colors"
            >
              DISCONNECT
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/60">
          <p className="text-zinc-500 text-xs font-mono mb-4">
            Sign in with Google, Discord, or email. Your XRPL wallet is derived from your social login — no seed to manage.
          </p>
          <button
            onClick={connectHumanWallet}
            disabled={humanLoading}
            className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm transition-colors"
          >
            {humanLoading ? 'CONNECTING...' : 'CONNECT HUMAN WALLET'}
          </button>
        </div>
      )}
    </div>
  )
}
