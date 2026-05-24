import type { GateType, Level, LevelOutput } from '../types'
import { rows } from '../utils/levelTargets'
import { ALL_GATES } from './gates'

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type BoolFn = (a: boolean, b: boolean, c?: boolean) => boolean

const FUNCTIONS: { name: string; fn: BoolFn; desc: string; rows2: boolean[]; rows3?: boolean[] }[] = [
  {
    name: 'AND Gate',
    fn: (a, b) => a && b,
    desc: 'Output 1 only when both inputs are 1.',
    rows2: rows(0, 0, 0, 1),
  },
  {
    name: 'OR Gate',
    fn: (a, b) => a || b,
    desc: 'Output 1 when any input is 1.',
    rows2: rows(0, 1, 1, 1),
  },
  {
    name: 'XOR Gate',
    fn: (a, b) => a !== b,
    desc: 'Output 1 when inputs differ.',
    rows2: rows(0, 1, 1, 0),
  },
  {
    name: 'NAND Gate',
    fn: (a, b) => !(a && b),
    desc: 'Output 1 unless both inputs are 1.',
    rows2: rows(1, 1, 1, 0),
  },
  {
    name: 'NOR Gate',
    fn: (a, b) => !(a || b),
    desc: 'Output 1 only when both inputs are 0.',
    rows2: rows(1, 0, 0, 0),
  },
  {
    name: 'Imply',
    fn: (a, b) => !a || b,
    desc: 'Output = NOT A OR B (implication).',
    rows2: rows(1, 0, 1, 1),
  },
  {
    name: 'Majority',
    fn: (a, b, c = false) => [a, b, c].filter(Boolean).length >= 2,
    desc: 'Output 1 when at least two of three inputs are 1.',
    rows2: rows(0, 0, 0, 1),
    rows3: rows(0, 0, 0, 1, 0, 1, 1, 1),
  },
  {
    name: 'Cascade OR',
    fn: (a, b, c = false) => (a && b) || c,
    desc: 'Output = (A AND B) OR C.',
    rows2: rows(0, 0, 0, 1),
    rows3: rows(0, 1, 0, 1, 0, 1, 1, 1),
  },
]

export function generateProceduralLevel(seed: number, xp: number): Level {
  const rand = mulberry32(seed)
  const useThreeInputs = rand() > 0.55 && xp >= 100
  const fnPick = FUNCTIONS[Math.floor(rand() * FUNCTIONS.length)]
  const inputCount = useThreeInputs && fnPick.rows3 ? 3 : 2

  const gatePool: GateType[] = [...ALL_GATES]
  const allowedCount = Math.min(gatePool.length, 3 + Math.floor(xp / 80))
  const allowedGates = gatePool.slice(0, allowedCount)

  const inputs = Array.from({ length: inputCount }, (_, i) => ({
    id: `p${i}`,
    label: String.fromCharCode(65 + i),
    x: 40,
    y: 80 + i * 90,
  }))

  const targetRows =
    inputCount === 3 && fnPick.rows3 ? fnPick.rows3 : fnPick.rows2

  const outputs: LevelOutput[] = [
    {
      id: 'out0',
      label: 'OUT',
      x: 520,
      y: 80 + ((inputCount - 1) * 90) / 2,
      target: targetRows[targetRows.length - 1],
      targetRows,
    },
  ]

  const difficulty = Math.floor(rand() * 3)
  const maxGates = inputCount + 2 + difficulty
  const timeLimit = 90 + inputCount * 30 + difficulty * 20

  return {
    id: 10000 + (seed % 90000),
    name: `PROC // ${fnPick.name}`,
    description: fnPick.desc,
    inputs,
    outputs,
    allowedGates,
    maxGates,
    timeLimit,
    xpReward: 40 + inputCount * 15 + difficulty * 10,
    hints: [
      `Implement: ${fnPick.name}`,
      'Use the truth table to verify every input row.',
      `Max ${maxGates} gates — optimize for 3 stars.`,
    ],
    isProcedural: true,
    seed,
  }
}

export function encodeLevelSeed(seed: number): string {
  return `NEON-CHAL-${seed.toString(36).toUpperCase()}`
}

export function decodeChallengeCode(code: string): number | null {
  const trimmed = code.trim().toUpperCase()
  const match = trimmed.match(/^NEON-CHAL-([0-9A-Z]+)$/)
  if (!match) return null
  const seed = parseInt(match[1], 36)
  return Number.isFinite(seed) ? seed : null
}
