// Must be imported first — patches process.nextTick for Web3Auth stream internals
if (typeof process === 'undefined') {
  (globalThis as any).process = {}
}
if (typeof process.nextTick === 'undefined') {
  (process as any).nextTick = (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
    queueMicrotask(() => fn(...args))
  }
}
if (typeof process.env === 'undefined') {
  (process as any).env = {}
}
