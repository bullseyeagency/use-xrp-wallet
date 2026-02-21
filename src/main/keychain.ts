import { app, safeStorage } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const storePath = () => join(app.getPath('userData'), 'wallet-store.json')

function readStore(): Record<string, string> {
  try {
    if (existsSync(storePath())) {
      return JSON.parse(readFileSync(storePath(), 'utf-8'))
    }
  } catch {}
  return {}
}

function writeStore(store: Record<string, string>) {
  writeFileSync(storePath(), JSON.stringify(store), 'utf-8')
}

export async function keychainSet(key: string, value: string): Promise<void> {
  const store = readStore()
  if (safeStorage.isEncryptionAvailable()) {
    store[key] = safeStorage.encryptString(value).toString('base64')
  } else {
    store[key] = Buffer.from(value).toString('base64')
  }
  writeStore(store)
}

export async function keychainGet(key: string): Promise<string | null> {
  const store = readStore()
  const val = store[key]
  if (!val) return null
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(val, 'base64'))
    } else {
      return Buffer.from(val, 'base64').toString('utf-8')
    }
  } catch {
    return null
  }
}

export async function keychainDelete(key: string): Promise<void> {
  const store = readStore()
  delete store[key]
  writeStore(store)
}
