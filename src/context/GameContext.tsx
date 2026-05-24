import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import { ALL_GATES, GATE_UNLOCK_XP } from '../engine/gates'
import type { Achievement, ChallengeRecord, GameSave, GateType, Screen } from '../types'
import {
  addChallengeRecord,
  dailySeed,
  DEFAULT_SAVE,
  loadSave,
  persistSave,
  todayKey,
} from '../utils/storage'

interface GameContextValue {
  save: GameSave
  screen: Screen
  setScreen: (s: Screen) => void
  currentLevelId: number | null
  setCurrentLevelId: (id: number | null) => void
  proceduralSeed: number | null
  setProceduralSeed: (seed: number) => void
  challengeSeed: number | null
  setChallengeSeed: (seed: number) => void
  tutorialSeen: boolean
  setTutorialSeen: (v: boolean) => void
  addXp: (amount: number) => void
  unlockAchievement: (id: string) => Achievement | null
  updateLevelProgress: (
    levelId: number,
    data: { stars: number; bestTime: number; bestScore: number },
  ) => void
  useHint: () => void
  resetSave: () => void
  isGateUnlocked: (gate: GateType) => boolean
  completeDaily: () => void
  saveCircuit: (name: string, state: import('../types').CircuitState) => void
  incrementLabVisit: () => void
  recordProceduralWin: (seed: number) => void
  submitChallengeScore: (code: string, record: ChallengeRecord) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<GameSave>(() => loadSave())
  const [screen, setScreen] = useState<Screen>('startup')
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null)
  const [proceduralSeed, setProceduralSeedState] = useState<number | null>(null)
  const [challengeSeed, setChallengeSeedState] = useState<number | null>(null)
  const [tutorialSeen, setTutorialSeen] = useState(false)

  const persist = useCallback((next: GameSave) => {
    setSave(next)
    persistSave(next)
  }, [])

  const addXp = useCallback((amount: number) => {
    setSave((prev) => {
      const next = { ...prev, xp: prev.xp + amount }
      const unlocked = new Set(next.unlockedGates)
      for (const gate of ALL_GATES) {
        if (next.xp >= GATE_UNLOCK_XP[gate]) unlocked.add(gate)
      }
      next.unlockedGates = [...unlocked]
      persistSave(next)
      return next
    })
  }, [])

  const unlockAchievement = useCallback(
    (id: string): Achievement | null => {
      const ach = ACHIEVEMENTS.find((a) => a.id === id)
      if (!ach || save.achievements.includes(id)) return null
      setSave((prev) => {
        const next = {
          ...prev,
          achievements: [...prev.achievements, id],
          xp: prev.xp + ach.xpBonus,
        }
        persistSave(next)
        return next
      })
      return ach
    },
    [save.achievements],
  )

  const updateLevelProgress = useCallback(
    (
      levelId: number,
      data: { stars: number; bestTime: number; bestScore: number },
    ) => {
      setSave((prev) => {
        const existing = prev.levelProgress[levelId]
        const next = {
          ...prev,
          levelProgress: {
            ...prev.levelProgress,
            [levelId]: {
              completed: true,
              stars: Math.max(existing?.stars ?? 0, data.stars),
              bestTime:
                existing?.bestTime != null
                  ? Math.min(existing.bestTime, data.bestTime)
                  : data.bestTime,
              bestScore: Math.max(existing?.bestScore ?? 0, data.bestScore),
            },
          },
        }
        persistSave(next)
        return next
      })
    },
    [],
  )

  const useHint = useCallback(() => {
    setSave((prev) => {
      const next = { ...prev, hintsUsed: prev.hintsUsed + 1 }
      persistSave(next)
      return next
    })
  }, [])

  const resetSave = useCallback(() => {
    persist({ ...DEFAULT_SAVE })
  }, [persist])

  const isGateUnlocked = useCallback(
    (gate: GateType) => save.unlockedGates.includes(gate),
    [save.unlockedGates],
  )

  const completeDaily = useCallback(() => {
    setSave((prev) => {
      const next = {
        ...prev,
        dailyChallenge: {
          date: todayKey(),
          levelId: 900,
          completed: true,
          seed: dailySeed(),
        },
      }
      persistSave(next)
      return next
    })
  }, [])

  const saveCircuit = useCallback((name: string, state: import('../types').CircuitState) => {
    setSave((prev) => {
      const fullState = {
        ...state,
        placedGates: state.placedGates ?? [],
      }
      const next = {
        ...prev,
        savedCircuits: [
          ...prev.savedCircuits,
          { id: `c-${Date.now()}`, name, createdAt: Date.now(), state: fullState },
        ].slice(-20),
      }
      persistSave(next)
      return next
    })
  }, [])

  const incrementLabVisit = useCallback(() => {
    setSave((prev) => {
      const next = { ...prev, labVisits: prev.labVisits + 1 }
      persistSave(next)
      return next
    })
  }, [])

  const recordProceduralWin = useCallback((seed: number) => {
    setSave((prev) => {
      const streak = prev.procedural.currentStreak + 1
      const next = {
        ...prev,
        procedural: {
          completed: prev.procedural.completed + 1,
          bestStreak: Math.max(prev.procedural.bestStreak, streak),
          currentStreak: streak,
          lastSeed: seed,
        },
      }
      persistSave(next)
      return next
    })
  }, [])

  const submitChallengeScore = useCallback((code: string, record: ChallengeRecord) => {
    setSave((prev) => addChallengeRecord(prev, code, record))
  }, [])

  const setProceduralSeed = useCallback((seed: number) => {
    setProceduralSeedState(seed)
    setCurrentLevelId(20000 + (seed % 10000))
  }, [])

  const setChallengeSeed = useCallback((seed: number) => {
    setChallengeSeedState(seed)
  }, [])

  const value = useMemo(
    () => ({
      save,
      screen,
      setScreen,
      currentLevelId,
      setCurrentLevelId,
      proceduralSeed,
      setProceduralSeed,
      challengeSeed,
      setChallengeSeed,
      tutorialSeen,
      setTutorialSeen,
      addXp,
      unlockAchievement,
      updateLevelProgress,
      useHint,
      resetSave,
      isGateUnlocked,
      completeDaily,
      saveCircuit,
      incrementLabVisit,
      recordProceduralWin,
      submitChallengeScore,
    }),
    [
      save,
      screen,
      currentLevelId,
      proceduralSeed,
      challengeSeed,
      tutorialSeen,
      addXp,
      unlockAchievement,
      updateLevelProgress,
      useHint,
      resetSave,
      isGateUnlocked,
      completeDaily,
      saveCircuit,
      incrementLabVisit,
      recordProceduralWin,
      submitChallengeScore,
      setProceduralSeed,
      setChallengeSeed,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
