import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDailyLevel, getLevelById, LEVELS } from '../../data/levels'
import { ALL_GATES } from '../../engine/gates'
import { useGame } from '../../context/GameContext'
import { useSound } from '../../hooks/useSound'
import type { GateType, PlacedGate, Wire } from '../../types'
import { dailySeed } from '../../utils/storage'
import { calcScore, calcStars } from '../../utils/scoring'
import { CircuitWorkbench } from '../lab/CircuitWorkbench'
import { NeonButton } from '../ui/NeonButton'
import { StarRating } from '../ui/StarRating'

export function GameScreen() {
  const {
    currentLevelId,
    setScreen,
    setCurrentLevelId,
    save,
    useHint,
    addXp,
    updateLevelProgress,
    unlockAchievement,
    completeDaily,
    isGateUnlocked,
  } = useGame()
  const { play } = useSound()

  const isDaily = currentLevelId != null && currentLevelId >= 900
  const level = useMemo(() => {
    if (currentLevelId == null) return undefined
    if (isDaily) return getDailyLevel(dailySeed())
    return getLevelById(currentLevelId)
  }, [currentLevelId, isDaily])

  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([])
  const [wires, setWires] = useState<Wire[]>([])
  const [inputValues, setInputValues] = useState<Record<string, boolean>>({})
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [hintIndex, setHintIndex] = useState(0)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [stars, setStars] = useState(0)
  const [hintsThisLevel, setHintsThisLevel] = useState(0)

  useEffect(() => {
    if (!level) return
    const init: Record<string, boolean> = {}
    level.inputs.forEach((inp) => {
      init[inp.id] = false
    })
    setInputValues(init)
    setPlacedGates([])
    setWires([])
    setElapsed(0)
    setWon(false)
    setHintIndex(0)
    setHintsThisLevel(0)
  }, [level?.id])

  useEffect(() => {
    if (won || !level) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [won, level])

  const handleVictory = useCallback(() => {
    if (!level || won) return
    const s = calcStars(elapsed, level.timeLimit, placedGates.length, level.maxGates)
    const sc = calcScore(s, elapsed, level.xpReward, hintsThisLevel)
    setStars(s)
    setScore(sc)
    setWon(true)
    addXp(sc)
    updateLevelProgress(level.id, { stars: s, bestTime: elapsed, bestScore: sc })
    play('win')

    unlockAchievement('first_win')
    if (elapsed < 30) unlockAchievement('speed_demon')
    if (s >= 3) unlockAchievement('three_stars')
    if (level.id === 8) unlockAchievement('boss_slayer')
    if (level.id === 12) unlockAchievement('fortress_boss')
    if (level.id === LEVELS.length) unlockAchievement('all_levels')
    if (hintsThisLevel === 0) unlockAchievement('no_hints')
    if (save.xp + sc >= 500) unlockAchievement('xp_500')
    if (isDaily) {
      completeDaily()
      unlockAchievement('daily_warrior')
    }
  }, [
    level,
    won,
    elapsed,
    placedGates.length,
    hintsThisLevel,
    addXp,
    updateLevelProgress,
    unlockAchievement,
    play,
    isDaily,
    completeDaily,
    save.xp,
  ])

  const handleHint = () => {
    if (!level || hintIndex >= level.hints.length) return
    useHint()
    setHintsThisLevel((h) => h + 1)
    setHintIndex((i) => i + 1)
    play('hint')
  }

  if (!level) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <NeonButton onClick={() => setScreen('campaign')}>Back to Campaign</NeonButton>
      </div>
    )
  }

  const timeLeft = Math.max(0, level.timeLimit - elapsed)
  const nandBossOnly = level.id === 8
  const paletteGates = nandBossOnly ? (['NAND'] as GateType[]) : level.allowedGates
  const allowedGates = paletteGates.filter((g) => nandBossOnly || isGateUnlocked(g))
  const unlockedForPalette = nandBossOnly
    ? (['NAND'] as GateType[])
    : ALL_GATES.filter((g) => isGateUnlocked(g) && level.allowedGates.includes(g))

  return (
    <div className="mx-auto min-h-screen max-w-6xl p-3 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <NeonButton variant="ghost" size="sm" onClick={() => setScreen(isDaily ? 'hub' : 'campaign')}>
          ← Exit
        </NeonButton>
        <div className="text-center">
          <h2 className="font-display text-lg font-bold text-white">
            {level.name}
            {level.isBoss && <span className="ml-2 text-[#ff00aa]">BOSS</span>}
          </h2>
          <p className="text-xs text-white/50">{level.description}</p>
        </div>
        <div className="font-display text-right">
          <p className={`text-xl ${timeLeft < 15 ? 'text-[#ff00aa]' : 'text-[#00f5ff]'}`}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </p>
          <p className="text-xs text-white/40">Score: {won ? score : '—'}</p>
        </div>
      </div>

      <CircuitWorkbench
        level={level}
        allowedGates={allowedGates}
        unlockedGates={unlockedForPalette}
        placedGates={placedGates}
        wires={wires}
        inputValues={inputValues}
        selectedGate={selectedGate}
        onGatesChange={setPlacedGates}
        onWiresChange={setWires}
        onInputToggle={(id) => setInputValues((p) => ({ ...p, [id]: !p[id] }))}
        onSelectGate={setSelectedGate}
        onVictory={handleVictory}
        maxGates={level.maxGates}
        nandOnly={nandBossOnly}
        showScopeDefault
        showTruthDefault={false}
        sidebar={
          <>
            <NeonButton size="sm" variant="ghost" className="w-full" onClick={handleHint} disabled={hintIndex >= level.hints.length}>
              Hint ({level.hints.length - hintIndex})
            </NeonButton>
            {hintIndex > 0 && (
              <p className="text-sm text-[#ffe600]">💡 {level.hints[hintIndex - 1]}</p>
            )}
          </>
        }
      />

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel max-w-sm rounded-2xl p-8 text-center"
            >
              <h2 className="font-display mb-2 text-3xl font-bold text-[#39ff14]">
                CIRCUIT SYNCED!
              </h2>
              <StarRating stars={stars} />
              <p className="mt-4 text-lg">
                Score: <span className="text-[#00f5ff]">{score}</span>
              </p>
              <p className="text-sm text-white/50">Time: {elapsed}s</p>
              <NeonButton
                className="mt-6 w-full"
                onClick={() => {
                  const next = LEVELS.find((l) => l.id === level.id + 1)
                  if (next && !isDaily) {
                    setCurrentLevelId(next.id)
                    setWon(false)
                    return
                  }
                  setScreen('campaign')
                }}
              >
                {LEVELS.find((l) => l.id === level.id + 1) && !isDaily
                  ? 'Next Level'
                  : 'Campaign Map'}
              </NeonButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
