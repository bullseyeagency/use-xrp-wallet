import { Web3Auth } from '@web3auth/modal'
import { WEB3AUTH_NETWORK } from '@web3auth/base'
import { Wallet } from 'xrpl'
import { WEB3AUTH_CLIENT_ID } from './config'

export function buildWeb3AuthConfig() {
  return {
    web3AuthOptions: {
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    },
  }
}

// After connect(), derive XRPL address from the raw secp256k1 private key.
// Web3Auth always returns a secp256k1 key — XRPL supports secp256k1 natively.
export async function getXrplAddressFromProvider(
  provider: { request: (args: { method: string }) => Promise<unknown> }
): Promise<string | null> {
  try {
    const privKey = await provider.request({ method: 'private_key' }) as string
    if (!privKey) return null
    // xrpl.js secp256k1 private key format: '00' prefix + 64-char hex
    const wallet = Wallet.fromPrivateKey('00' + privKey)
    return wallet.address
  } catch (err) {
    console.error('getXrplAddress error:', err)
    return null
  }
}
