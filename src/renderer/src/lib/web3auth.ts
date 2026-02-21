import { Web3Auth } from '@web3auth/modal'
import { XrplPrivateKeyProvider } from '@web3auth/xrpl-provider'
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, type CustomChainConfig } from '@web3auth/base'
import { WEB3AUTH_CLIENT_ID } from './config'

export const XRPL_MAINNET: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.OTHER,
  chainId: '0x1',
  rpcTarget: 'https://xrplcluster.com',
  wsTarget: 'wss://xrplcluster.com',
  displayName: 'XRPL Mainnet',
  blockExplorerUrl: 'https://livenet.xrpl.org',
  ticker: 'XRP',
  tickerName: 'XRPL',
}

export function buildWeb3AuthConfig() {
  return {
    web3AuthOptions: {
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      chains: [XRPL_MAINNET],
      defaultChainId: '0x1',
    },
  }
}

// After connect(), extract the XRPL address from the provider
export async function getXrplAddressFromProvider(
  provider: { request: (args: { method: string }) => Promise<unknown> }
): Promise<string | null> {
  // Try calling xrpl_getAccounts directly — works if Web3Auth set up the XRPL provider
  try {
    const accounts = await provider.request({ method: 'xrpl_getAccounts' }) as string[]
    if (accounts?.[0]) return accounts[0]
  } catch {}

  // Fallback: get raw private key and wrap in XrplPrivateKeyProvider
  try {
    const privKey = await provider.request({ method: 'private_key' }) as string
    if (!privKey) return null

    const xrplProvider = await XrplPrivateKeyProvider.getProviderInstance({
      privKey,
      chainConfig: { ...XRPL_MAINNET, chainNamespace: 'xrpl' as any },
    })

    const accounts = await xrplProvider.request({ method: 'xrpl_getAccounts' }) as string[]
    return accounts?.[0] ?? null
  } catch (err) {
    console.error('getXrplAddress error:', err)
    return null
  }
}
