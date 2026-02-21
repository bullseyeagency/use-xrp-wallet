import express from 'express'
import cors from 'cors'
import { keychainGet } from './keychain'
import { Client, Wallet } from 'xrpl'

const PORT = process.env.WALLET_API_PORT || 7373
const TOKEN = process.env.WALLET_API_TOKEN || 'dev-token'
const XRPL_URL = 'wss://xrplcluster.com'

// Auth middleware
function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (token !== TOKEN) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

async function getWallet(): Promise<Wallet> {
  const seed = await keychainGet('agent_seed')
  if (!seed) throw new Error('Agent wallet not configured')
  return Wallet.fromSeed(seed)
}

export function startApiServer() {
  const app = express()
  app.use(cors({ origin: '*' }))
  app.use(express.json())

  // GET /balance
  app.get('/balance', auth, async (req, res) => {
    try {
      const wallet = await getWallet()
      const client = new Client(XRPL_URL)
      await client.connect()
      try {
        const info = await client.request({
          command: 'account_info',
          account: wallet.address,
          ledger_index: 'current',
        })
        const drops = Number(info.result.account_data.Balance)
        res.json({
          address: wallet.address,
          drops,
          xrp: drops / 1_000_000,
          usd: (drops / 1_000_000) * 1.40,
          activated: true,
        })
      } catch (e: any) {
        // Account not funded yet — return zero balance
        res.json({
          address: wallet.address,
          drops: 0,
          xrp: 0,
          usd: 0,
          activated: false,
        })
      } finally {
        await client.disconnect()
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /pay
  app.post('/pay', auth, async (req, res) => {
    try {
      const { to, drops } = req.body
      if (!to || !drops) {
        res.status(400).json({ error: 'to and drops required' })
        return
      }
      const wallet = await getWallet()
      const client = new Client(XRPL_URL)
      await client.connect()
      const tx = await client.submitAndWait({
        TransactionType: 'Payment',
        Account: wallet.address,
        Destination: to,
        Amount: String(drops),
      }, { wallet })
      await client.disconnect()
      res.json({ txHash: tx.result.hash, drops })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /address
  app.get('/address', auth, async (req, res) => {
    try {
      const wallet = await getWallet()
      res.json({ address: wallet.address })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Health check (no auth — OpenClaw can check if wallet is running)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'use-xrp-wallet' })
  })

  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`UseXRP Wallet API running on localhost:${PORT}`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} already in use — wallet API already running`)
    } else {
      console.error('Wallet API error:', err)
    }
  })
}
