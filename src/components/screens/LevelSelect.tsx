import { motion } from 'framer-motion'
import { LEVELS } from '../../data/levels'
import { useGame } from '../../context/GameContext'
import { Dashboard } from '../ui/Dashboard'
import { NeonButton } from '../ui/NeonButton'
import { StarRating } from '../ui/StarRating'

export function LevelSelect() {
  const { setScreen, setCurrentLevelId, save } = useGame()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mx-auto min-h-screen max-w-4xl p-4 md:p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <NeonButton variant="ghost" size="sm" onClick={() => setScreen('hub')}>
          ← Hub
        </NeonButton>
        <h2 className="font-display text-xl tracking-wider text-[#00f5ff]">
          CAMPAIGN
        </h2>
        <div className="w-20" />
      </div>

      <Dashboard />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {LEVELS.map((level, i) => {
          const progress = save.levelProgress[level.id]
          const locked = i > 0 && !save.levelProgress[LEVELS[i - 1].id]?.completed

          return (
            <motion.button
              key={level.id}
              type="button"
              disabled={locked}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={locked ? {} : { scale: 1.02 }}
              onClick={() => {
                setCurrentLevelId(level.id)
                setScreen('game')
              }}
              className={`glass-panel rounded-xl p-4 text-left transition-all ${
                locked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-[#00f5ff]/60'
              } ${level.isBoss ? 'border-[#ff00aa]/50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-display text-xs text-white/40">
                    LEVEL {level.id}
                    {level.isBoss && ' — BOSS'}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    {level.name}
                  </h3>
                </div>
                {progress && <StarRating stars={progress.stars} />}
              </div>
              <p className="mt-1 text-sm text-white/50">{level.description}</p>
              <div className="mt-2 flex gap-2 text-xs text-[#00f5ff]/70">
                <span>+{level.xpReward} XP</span>
                <span>•</span>
                <span>{level.timeLimit}s limit</span>
                <span>•</span>
                <span>max {level.maxGates} gates</span>
              </div>
              {locked && (
                <p className="mt-2 text-xs text-[#ff00aa]">Complete previous level to unlock</p>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
