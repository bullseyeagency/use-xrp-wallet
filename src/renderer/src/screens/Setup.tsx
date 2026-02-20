import { useState } from 'react'
import { Wallet } from 'xrpl'

type Step = 'choose' | 'generate' | 'import' | 'backup' | 'password'

export default function Setup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('choose')
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [seed, setSeed] = useState('')
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    const w = Wallet.generate()
    setWallet(w)
    setSeed(w.seed!)
    setStep('backup')
  }

  async function importWallet() {
    try {
      const w = Wallet.fromSeed(seed)
      setWallet(w)
      setStep('password')
    } catch {
      setError('Invalid seed phrase')
    }
  }

  async function save() {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    await (window as any).keychain.set('agent_seed', seed)
    await (window as any).keychain.set('agent_address', wallet!.address)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 pt-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">X</div>
        <span className="text-white font-black text-base">UseXRP Wallet</span>
      </div>

      {step === 'choose' && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-black text-white">Set up wallet</h1>
          <p className="text-zinc-500 text-xs">This wallet will be used by the OpenClaw agent on this machine.</p>
          <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-sm transition-colors mt-4">
            GENERATE NEW WALLET
          </button>
          <button onClick={() => setStep('import')} className="w-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono py-4 rounded-2xl text-sm transition-colors">
            IMPORT EXISTING SEED
          </button>
        </div>
      )}

      {step === 'generate' && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-black text-white">Generating...</h1>
        </div>
      )}

      {step === 'import' && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-black text-white">Import wallet</h1>
          <textarea
            value={seed}
            onChange={e => setSeed(e.target.value)}
            placeholder="Enter seed phrase (sXXXXXX...)"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500 resize-none"
          />
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
          <button onClick={importWallet} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-sm transition-colors">
            IMPORT
          </button>
        </div>
      )}

      {step === 'backup' && wallet && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-black text-white">Back up your seed</h1>
          <p className="text-zinc-500 text-xs font-mono">Write this down and store it securely. This is the only way to recover the wallet.</p>
          <div className="bg-zinc-900 border border-yellow-700/50 rounded-xl p-4">
            <p className="text-yellow-400 text-xs font-mono mb-2">SEED PHRASE — NEVER SHARE THIS</p>
            <p className="text-white font-mono text-sm break-all">{wallet.seed}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs font-mono mb-1">WALLET ADDRESS</p>
            <p className="text-blue-400 font-mono text-xs break-all">{wallet.address}</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="w-4 h-4" />
            <span className="text-zinc-400 text-xs font-mono">I have written down my seed phrase</span>
          </label>
          <button
            onClick={() => setStep('password')}
            disabled={!confirmed}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl text-sm transition-colors"
          >
            CONTINUE
          </button>
        </div>
      )}

      {step === 'password' && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-black text-white">Set password</h1>
          <p className="text-zinc-500 text-xs font-mono">Used to unlock the wallet on this machine.</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
          <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-sm transition-colors mt-2">
            SAVE & LAUNCH
          </button>
        </div>
      )}
    </div>
  )
}
