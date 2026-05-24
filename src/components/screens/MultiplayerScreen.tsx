import { useMemo, useState } from 'react'
import {
  decodeChallengeCode,
  encodeLevelSeed,
  generateProceduralLevel,
} from '../../engine/procedural'
import { proceduralSeed } from '../../utils/storage'
import { ALL_GATES } from '../../engine/gates'
import { useGame } from '../../context/GameContext'
import { PlatformShell } from '../layout/PlatformShell'
import { CircuitWorkbench } from '../lab/CircuitWorkbench'
import { NeonButton } from '../ui/NeonButton'
import type { GateType, PlacedGate, Wire } from '../../types'
import { calcScore, calcStars } from '../../utils/scoring'

export function MultiplayerScreen() {
  const {
    save,
    challengeSeed,
    setChallengeSeed,
    setScreen,
    isGateUnlocked,
    addXp,
    submitChallengeScore,
    unlockAchievement,
  } = useGame()

  const [hostName, setHostName] = useState('Architect')
  const [joinCode, setJoinCode] = useState('')
  const [activeSeed, setActiveSeed] = useState<number | null>(challengeSeed)
  const [mode, setMode] = useState<'lobby' | 'play'>('lobby')
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([])
  const [wires, setWires] = useState<Wire[]>([])
  const [inputValues, setInputValues] = useState<Record<string, boolean>>({})
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [won, setWon] = useState(false)

  const level = useMemo(() => {
    if (activeSeed == null) return null
    return generateProceduralLevel(activeSeed, save.xp)
  }, [activeSeed, save.xp])

  const challengeCode = activeSeed != null ? encodeLevelSeed(activeSeed) : ''
  const leaderboard = save.challenges.find((c) => c.code === challengeCode)?.records ?? []

  const createChallenge = () => {
    const seed = proceduralSeed()
    setActiveSeed(seed)
    setChallengeSeed(seed)
    setMode('play')
    resetCircuit(seed)
    unlockAchievement('multiplayer_host')
  }

  const joinChallenge = () => {
    const seed = decodeChallengeCode(joinCode)
    if (seed == null) return
    setActiveSeed(seed)
    setMode('play')
    resetCircuit(seed)
    unlockAchievement('multiplayer_join')
  }

  const resetCircuit = (seed: number) => {
    const lv = generateProceduralLevel(seed, save.xp)
    const init: Record<string, boolean> = {}
    lv.inputs.forEach((i) => {
      init[i.id] = false
    })
    setInputValues(init)
    setPlacedGates([])
    setWires([])
    setElapsed(0)
    setWon(false)
  }

  const handleVictory = () => {
    if (!level || won) return
    const s = calcStars(elapsed, level.timeLimit, placedGates.length, level.maxGates)
    const sc = calcScore(s, elapsed, level.xpReward, 0)
    addXp(sc)
    setWon(true)
    submitChallengeScore(challengeCode, {
      code: challengeCode,
      playerName: hostName,
      timeSeconds: elapsed,
      score: sc,
      completedAt: Date.now(),
    })
  }

  const unlocked =
    level?.allowedGates.filter(isGateUnlocked) ?? ALL_GATES.filter(isGateUnlocked)

  if (mode === 'lobby') {
    return (
      <PlatformShell title="Versus Link" subtitle="Async multiplayer via challenge codes">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-panel space-y-4 rounded-xl p-6">
            <h2 className="font-display text-[#00f5ff]">HOST CHALLENGE</h2>
            <p className="text-sm text-white/50">
              Generate a unique circuit puzzle and share the code with a friend.
            </p>
            <input
              className="w-full rounded border border-white/20 bg-black/50 px-3 py-2"
              placeholder="Your callsign"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
            <NeonButton className="w-full" onClick={createChallenge}>
              Create Challenge
            </NeonButton>
          </div>

          <div className="glass-panel space-y-4 rounded-xl p-6">
            <h2 className="font-display text-[#ff00aa]">JOIN CHALLENGE</h2>
            <input
              className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono uppercase"
              placeholder="NEON-CHAL-XXXX"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <NeonButton variant="magenta" className="w-full" onClick={joinChallenge}>
              Enter Arena
            </NeonButton>
          </div>
        </div>

        {save.challenges.length > 0 && (
          <div className="glass-panel mt-6 rounded-xl p-4">
            <p className="font-display mb-3 text-xs text-white/50">RECENT ARENAS</p>
            <div className="space-y-2">
              {save.challenges.slice(-5).reverse().map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  className="flex w-full justify-between rounded border border-white/10 px-3 py-2 text-left text-sm hover:border-[#00f5ff]/40"
                  onClick={() => {
                    setJoinCode(ch.code)
                    setActiveSeed(ch.levelSeed)
                  }}
                >
                  <span className="font-mono text-[#00f5ff]">{ch.code}</span>
                  <span className="text-white/40">{ch.records.length} runs</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </PlatformShell>
    )
  }

  if (!level) return null

  return (
    <PlatformShell title="Versus Arena" subtitle={challengeCode}>
      <div className="mb-4 flex flex-wrap gap-2">
        <NeonButton size="sm" variant="ghost" onClick={() => setMode('lobby')}>
          ← Lobby
        </NeonButton>
        <button
          type="button"
          className="rounded border border-[#00f5ff]/30 px-3 py-1 font-mono text-xs text-[#00f5ff]"
          onClick={() => navigator.clipboard?.writeText(challengeCode)}
        >
          Copy {challengeCode}
        </button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-lg p-3">
          <p className="mb-2 text-xs text-white/50">LEADERBOARD</p>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-white/30">Be the first to complete!</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {[...leaderboard]
                .sort((a, b) => a.timeSeconds - b.timeSeconds)
                .slice(0, 5)
                .map((r, i) => (
                  <li key={r.completedAt} className="flex justify-between">
                    <span>
                      #{i + 1} {r.playerName}
                    </span>
                    <span className="text-[#39ff14]">{r.timeSeconds}s</span>
                  </li>
                ))}
            </ol>
          )}
        </div>
        <div className="glass-panel rounded-lg p-3 text-sm text-white/50">
          <p>Same procedural puzzle for all players.</p>
          <p className="mt-2">Fastest valid solve wins the arena.</p>
        </div>
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
      />

      {won && (
        <div className="glass-panel mt-4 rounded-xl p-4 text-center">
          <p className="font-display text-[#39ff14]">RUN LOGGED — {elapsed}s</p>
          <NeonButton className="mt-2" onClick={() => setScreen('hub')}>
            Return to Hub
          </NeonButton>
        </div>
      )}
    </PlatformShell>
  )
}
