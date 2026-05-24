import { DEFAULT_UNLOCKED } from '../data/levels'
import { decodeChallengeCode } from '../engine/procedural'
import type { ChallengeRecord, GameSave, MultiplayerChallenge } from '../types'

const STORAGE_KEY = 'neon-logic-save-v2'

export const DEFAULT_SAVE: GameSave = {
  xp: 0,
  unlockedGates: [...DEFAULT_UNLOCKED],
  achievements: [],
  levelProgress: {},
  dailyChallenge: null,
  savedCircuits: [],
  totalPlayTime: 0,
  hintsUsed: 0,
  procedural: {
    completed: 0,
    bestStreak: 0,
    currentStreak: 0,
    lastSeed: null,
  },
  challenges: [],
  labVisits: 0,
}

export function loadSave(): GameSave {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem('neon-logic-save')
    if (!raw) return { ...DEFAULT_SAVE }
    const parsed = JSON.parse(raw) as Partial<GameSave>
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      procedural: { ...DEFAULT_SAVE.procedural, ...parsed.procedural },
      challenges: parsed.challenges ?? [],
    }
  } catch {
    return { ...DEFAULT_SAVE }
  }
}

export function persistSave(save: GameSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function dailySeed(): number {
  const key = todayKey()
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function proceduralSeed(): number {
  return Math.floor(Math.random() * 1_000_000)
}

export function addChallengeRecord(
  save: GameSave,
  code: string,
  record: ChallengeRecord,
): GameSave {
  const existing = save.challenges.find((c) => c.code === code)
  if (existing) {
    return {
      ...save,
      challenges: save.challenges.map((c) =>
        c.code === code ? { ...c, records: [...c.records, record].slice(-50) } : c,
      ),
    }
  }
  const challenge: MultiplayerChallenge = {
    id: `ch-${Date.now()}`,
    code,
    hostName: record.playerName,
    levelSeed: decodeChallengeCode(code) ?? dailySeed(),
    createdAt: Date.now(),
    records: [record],
  }
  return {
    ...save,
    challenges: [...save.challenges, challenge].slice(-20),
  }
}
