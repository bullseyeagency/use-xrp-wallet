import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('keychain', {
  set: (key: string, value: string) => ipcRenderer.invoke('keychain:set', key, value),
  get: (key: string) => ipcRenderer.invoke('keychain:get', key),
  delete: (key: string) => ipcRenderer.invoke('keychain:delete', key),
})
