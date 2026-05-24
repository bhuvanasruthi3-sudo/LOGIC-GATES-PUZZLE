import { useState } from 'react'
import { dailySeed, todayKey } from '../../utils/storage'
import { NeonButton } from './NeonButton'

export function ShareChallenge() {
  const [copied, setCopied] = useState(false)
  const code = `NEON-${todayKey().replace(/-/g, '')}-${dailySeed().toString(36).toUpperCase()}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="glass-panel rounded-lg p-3 text-center">
      <p className="font-display mb-1 text-xs tracking-widest text-[#ff00aa] uppercase">
        Daily Challenge Code
      </p>
      <p className="font-mono text-lg text-[#00f5ff]">{code}</p>
      <p className="mt-1 text-xs text-white/40">Share with friends — same puzzle today</p>
      <NeonButton size="sm" variant="ghost" className="mt-2 w-full" onClick={copy}>
        {copied ? 'Copied!' : 'Copy Code'}
      </NeonButton>
    </div>
  )
}
