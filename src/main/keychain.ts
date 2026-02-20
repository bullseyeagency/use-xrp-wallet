import keytar from 'keytar'

const SERVICE = 'UseXRP Wallet'

export async function keychainSet(key: string, value: string): Promise<void> {
  await keytar.setPassword(SERVICE, key, value)
}

export async function keychainGet(key: string): Promise<string | null> {
  return await keytar.getPassword(SERVICE, key)
}

export async function keychainDelete(key: string): Promise<void> {
  await keytar.deletePassword(SERVICE, key)
}
