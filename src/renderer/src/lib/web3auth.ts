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
  try {
    // Get the raw private key Web3Auth derived from social login
    const privKey = await provider.request({ method: 'private_key' }) as string
    if (!privKey) return null

    // Wrap it in XrplPrivateKeyProvider to get XRPL-specific methods
    const xrplProvider = await XrplPrivateKeyProvider.getProviderInstance({
      privKey,
      chainConfig: XRPL_MAINNET,
    })

    const accounts = await xrplProvider.request({ method: 'xrpl_getAccounts' }) as string[]
    return accounts?.[0] ?? null
  } catch (err) {
    console.error('getXrplAddress error:', err)
    return null
  }
}
