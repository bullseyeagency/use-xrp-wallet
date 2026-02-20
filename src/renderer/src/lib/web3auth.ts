import { Web3Auth } from '@web3auth/modal'
import { XrplPrivateKeyProvider } from '@web3auth/xrpl-provider'
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base'
import { WEB3AUTH_CLIENT_ID } from './config'

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.OTHER,
  chainId: '0x1',
  rpcTarget: 'https://xrplcluster.com',
  displayName: 'XRPL Mainnet',
  blockExplorerUrl: 'https://livenet.xrpl.org',
  ticker: 'XRP',
  tickerName: 'XRPL',
}

let instance: Web3Auth | null = null

export function getWeb3Auth(): Web3Auth {
  if (!instance) {
    const privateKeyProvider = new XrplPrivateKeyProvider({ config: { chainConfig } })
    instance = new Web3Auth({
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      privateKeyProvider,
    })
  }
  return instance
}

export async function getXrplAddress(): Promise<string | null> {
  const web3auth = getWeb3Auth()
  if (!web3auth.provider) return null
  try {
    const accounts = await web3auth.provider.request<never, string[]>({ method: 'xrpl_getAccounts' })
    return accounts?.[0] ?? null
  } catch {
    return null
  }
}
