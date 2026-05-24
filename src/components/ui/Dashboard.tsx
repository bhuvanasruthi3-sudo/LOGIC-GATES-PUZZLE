import { motion } from 'framer-motion'
import { ACHIEVEMENTS } from '../../data/achievements'
import { GATE_UNLOCK_XP } from '../../engine/gates'
import { useGame } from '../../context/GameContext'
import type { GateType } from '../../types'

export function Dashboard() {
  const { save, isGateUnlocked } = useGame()
  const nextXp = Object.values(GATE_UNLOCK_XP).find((x) => x > save.xp) ?? save.xp
  const xpProgress = Math.min(100, (save.xp / Math.max(nextXp, 1)) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-lg p-3 md:p-4"
    >
      <div className="flex items-center gap-4">
        <div>
          <p className="font-display text-xs tracking-widest text-[#00f5ff]/70 uppercase">
            XP
          </p>
          <p className="font-display text-2xl font-bold text-[#00f5ff]">{save.xp}</p>
        </div>
        <div className="hidden h-10 w-px bg-white/10 sm:block" />
        <div className="min-w-[120px]">
          <div className="h-2 overflow-hidden rounded-full bg-black/50">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#00f5ff] to-[#ff00aa]"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-white/50">Next unlock at {nextXp} XP</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'] as GateType[]).map((g) => (
          <span
            key={g}
            className={`font-display rounded border px-2 py-0.5 text-xs ${
              isGateUnlocked(g)
                ? 'border-[#39ff14]/50 text-[#39ff14]'
                : 'border-white/10 text-white/30'
            }`}
            title={isGateUnlocked(g) ? 'Unlocked' : `Unlock at ${GATE_UNLOCK_XP[g]} XP`}
          >
            {g}
          </span>
        ))}
      </div>

      <div className="flex gap-1">
        {ACHIEVEMENTS.filter((a) => save.achievements.includes(a.id))
          .slice(0, 5)
          .map((a) => (
            <span key={a.id} className="text-lg" title={a.title}>
              {a.icon}
            </span>
          ))}
        {save.achievements.length === 0 && (
          <span className="text-xs text-white/40">No badges yet</span>
        )}
      </div>
    </motion.div>
  )
}
