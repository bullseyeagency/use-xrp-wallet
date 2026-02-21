import { config } from 'dotenv'
import { join } from 'path'
config({ path: join(process.cwd(), '.env') })

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { startApiServer } from './api'
import { keychainGet, keychainSet, keychainDelete } from './keychain'

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 420,
    height: 680,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
    if (is.dev) win.webContents.openDevTools({ mode: 'detach' })
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Web3Auth and OAuth popups to open inside Electron
    // so postMessage callbacks work correctly
    const isOAuth = url.includes('web3auth.io') ||
      url.includes('accounts.google.com') ||
      url.includes('auth.web3auth.io') ||
      url.includes('discord.com/oauth')
    if (isOAuth) return { action: 'allow' }
    // All other external links → system browser
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

// Single instance lock — quit if another instance is already running
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.usexrp.wallet')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for keychain
  ipcMain.handle('keychain:set', async (_, key: string, value: string) => {
    await keychainSet(key, value)
  })
  ipcMain.handle('keychain:get', async (_, key: string) => {
    return await keychainGet(key)
  })
  ipcMain.handle('keychain:delete', async (_, key: string) => {
    await keychainDelete(key)
  })

  // Start local API server for OpenClaw
  startApiServer()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
