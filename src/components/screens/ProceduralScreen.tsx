import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ALL_GATES } from '../../engine/gates'
import { encodeLevelSeed, generateProceduralLevel } from '../../engine/procedural'
import { proceduralSeed } from '../../utils/storage'
import { useGame } from '../../context/GameContext'
import { PlatformShell } from '../layout/PlatformShell'
import { CircuitWorkbench } from '../lab/CircuitWorkbench'
import { NeonButton } from '../ui/NeonButton'
import { StarRating } from '../ui/StarRating'
import type { GateType, PlacedGate, Wire } from '../../types'
import { calcScore, calcStars } from '../../utils/scoring'

export function ProceduralScreen() {
  const {
    save,
    proceduralSeed: seed,
    setProceduralSeed,
    isGateUnlocked,
    addXp,
    recordProceduralWin,
    unlockAchievement,
  } = useGame()

  const activeSeed = seed ?? proceduralSeed()
  const level = useMemo(
    () => generateProceduralLevel(activeSeed, save.xp),
    [activeSeed, save.xp],
  )

  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([])
  const [wires, setWires] = useState<Wire[]>([])
  const [inputValues, setInputValues] = useState<Record<string, boolean>>({})
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [won, setWon] = useState(false)
  const [stars, setStars] = useState(0)

  useEffect(() => {
    const init: Record<string, boolean> = {}
    level.inputs.forEach((i) => {
      init[i.id] = false
    })
    setInputValues(init)
    setPlacedGates([])
    setWires([])
    setElapsed(0)
    setWon(false)
  }, [activeSeed])

  useEffect(() => {
    if (won) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [won])

  const unlocked = ALL_GATES.filter(
    (g) => isGateUnlocked(g) && level.allowedGates.includes(g),
  )

  const handleVictory = useCallback(() => {
    if (won) return
    const s = calcStars(elapsed, level.timeLimit, placedGates.length, level.maxGates)
    const sc = calcScore(s, elapsed, level.xpReward, 0)
    setStars(s)
    setWon(true)
    addXp(sc)
    recordProceduralWin(activeSeed)
    unlockAchievement('procedural_first')
    if (save.procedural.currentStreak + 1 >= 5) unlockAchievement('streak_5')
  }, [won, elapsed, level, placedGates.length, activeSeed, addXp, recordProceduralWin, unlockAchievement, save.procedural.currentStreak])

  const nextPuzzle = () => {
    const next = proceduralSeed()
    setProceduralSeed(next)
    setWon(false)
  }

  return (
    <PlatformShell
      title="Infinite Logic Stream"
      subtitle={`Seed ${activeSeed} · Streak ${save.procedural.currentStreak} · Best ${save.procedural.bestStreak}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-[#39ff14]">{encodeLevelSeed(activeSeed)}</p>
        <NeonButton size="sm" variant="ghost" onClick={nextPuzzle}>
          Skip → New Seed
        </NeonButton>
      </div>

      <CircuitWorkbench
        level={level}
        allowedGates={level.allowedGates}
        unlockedGates={unlocked}
        placedGates={placedGates}
        wires={wires}
        inputValues={inputValues}
        selectedGate={selectedGate}
        onGatesChange={setPlacedGates}
        onWiresChange={setWires}
        onInputToggle={(id) =>
          setInputValues((p) => ({ ...p, [id]: !p[id] }))
        }
        onSelectGate={setSelectedGate}
        onVictory={handleVictory}
        maxGates={level.maxGates}
        showScopeDefault
        showTruthDefault
        header={
          <p className="text-sm text-white/60">{level.description}</p>
        }
      />

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="glass-panel max-w-sm rounded-2xl p-8 text-center">
              <h2 className="font-display text-2xl text-[#39ff14]">STREAM CLEARED</h2>
              <StarRating stars={stars} />
              <p className="mt-2 text-white/50">Time: {elapsed}s</p>
              <NeonButton className="mt-4 w-full" onClick={nextPuzzle}>
                Next Procedural Puzzle
              </NeonButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PlatformShell>
  )
}
