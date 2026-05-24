import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useGame } from '../../context/GameContext'
import type { Screen } from '../../types'
import { Dashboard } from '../ui/Dashboard'
import { NeonButton } from '../ui/NeonButton'

const NAV: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'hub', label: 'Hub', icon: '◈' },
  { screen: 'campaign', label: 'Campaign', icon: '▶' },
  { screen: 'lab', label: 'Lab', icon: '⚗' },
  { screen: 'procedural', label: 'Infinite', icon: '∞' },
  { screen: 'multiplayer', label: 'Versus', icon: '⚔' },
]

export function PlatformShell({
  title,
  subtitle,
  children,
  backTo = 'hub',
}: {
  title: string
  subtitle?: string
  children: ReactNode
  backTo?: Screen
}) {
  const { setScreen, screen } = useGame()

  return (
    <div className="mx-auto min-h-screen max-w-6xl p-3 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <NeonButton variant="ghost" size="sm" onClick={() => setScreen(backTo)}>
          ← Hub
        </NeonButton>
        <div className="text-center">
          <h1 className="font-display text-lg font-bold tracking-wider text-white md:text-xl">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
        </div>
        <div className="w-16" />
      </div>

      <Dashboard />

      <nav className="mt-4 flex gap-1 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-1">
        {NAV.map((item) => (
          <button
            key={item.screen}
            type="button"
            onClick={() => setScreen(item.screen)}
            className={`font-display shrink-0 rounded px-3 py-1.5 text-xs tracking-wider transition-all ${
              screen === item.screen
                ? 'bg-[#00f5ff]/20 text-[#00f5ff]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <motion.div
        key={title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        {children}
      </motion.div>
    </div>
  )
}
