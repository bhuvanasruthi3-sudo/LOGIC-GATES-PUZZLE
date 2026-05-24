import type { GateType, Level } from '../types'
import { rows } from '../utils/levelTargets'

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'First Pulse',
    description: 'Route signal A through an AND gate to light the output.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 120 },
      { id: 'b', label: 'B', x: 40, y: 220 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 170,
        target: true,
        targetRows: rows(0, 0, 0, 1),
      },
    ],
    allowedGates: ['AND'],
    maxGates: 2,
    timeLimit: 90,
    xpReward: 50,
    hints: [
      'Both inputs must be ON for AND to output 1.',
      'Toggle A and B ON, then connect both to AND inputs.',
      'Connect AND output to OUT.',
    ],
  },
  {
    id: 2,
    name: 'Union Path',
    description: 'Use OR so either input activates the output.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 140 },
      { id: 'b', label: 'B', x: 40, y: 240 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 190,
        target: true,
        targetRows: rows(0, 1, 1, 1),
      },
    ],
    allowedGates: ['OR', 'AND'],
    maxGates: 2,
    timeLimit: 90,
    xpReward: 60,
    hints: ['OR outputs 1 when any input is 1.', 'Only one input needs to be ON.'],
  },
  {
    id: 3,
    name: 'Inverter',
    description: 'Flip the signal with NOT.',
    inputs: [{ id: 'a', label: 'A', x: 40, y: 180 }],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 180,
        target: true,
        targetRows: rows(1, 0),
      },
    ],
    allowedGates: ['NOT', 'AND'],
    maxGates: 2,
    timeLimit: 75,
    xpReward: 70,
    hints: ['Turn A ON — NOT inverts it to 0.', 'Wait: target is 1. Start with A OFF.'],
  },
  {
    id: 4,
    name: 'Exclusive',
    description: 'XOR — output when inputs differ.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 130 },
      { id: 'b', label: 'B', x: 40, y: 230 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 180,
        target: true,
        targetRows: rows(0, 1, 1, 0),
      },
    ],
    allowedGates: ['XOR', 'AND', 'OR', 'NOT'],
    maxGates: 3,
    timeLimit: 120,
    xpReward: 90,
    hints: ['XOR is 1 when A ≠ B.', 'Try A=ON, B=OFF.'],
  },
  {
    id: 5,
    name: 'NAND Nexus',
    description: 'Master the universal NAND gate.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 120 },
      { id: 'b', label: 'B', x: 40, y: 220 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 170,
        target: true,
        targetRows: rows(1, 1, 1, 0),
      },
    ],
    allowedGates: ['NAND', 'NOT'],
    maxGates: 3,
    timeLimit: 120,
    xpReward: 100,
    hints: ['NAND = NOT(AND).', 'Output 1 whenever NAND gate outputs 1.'],
  },
  {
    id: 6,
    name: 'Dual Target',
    description: 'Drive two outputs with shared logic.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 100 },
      { id: 'b', label: 'B', x: 40, y: 200 },
      { id: 'c', label: 'C', x: 40, y: 300 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'Y1',
        x: 520,
        y: 140,
        target: true,
        targetRows: rows(0, 0, 0, 1, 0, 0, 0, 1),
      },
      {
        id: 'out2',
        label: 'Y2',
        x: 520,
        y: 260,
        target: false,
        targetRows: rows(0, 0, 0, 0, 0, 0, 0, 0),
      },
    ],
    allowedGates: ['AND', 'OR', 'NOT', 'XOR'],
    maxGates: 5,
    timeLimit: 180,
    xpReward: 120,
    hints: ['Y1 = A AND B (on only when A and B are ON).', 'Y2 must stay 0 for every input combo.'],
  },
  {
    id: 7,
    name: 'NOR Storm',
    description: 'Build with NOR gates only.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 150 },
      { id: 'b', label: 'B', x: 40, y: 250 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 200,
        target: true,
        targetRows: rows(1, 0, 0, 0),
      },
    ],
    allowedGates: ['NOR', 'NOT'],
    maxGates: 4,
    timeLimit: 150,
    xpReward: 130,
    hints: ['NOR is NOT(A OR B).', 'Double NOR can make AND.'],
  },
  {
    id: 8,
    name: 'BOSS: NAND Forge',
    description: 'BOSS LEVEL — Construct the solution using ONLY NAND gates.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 120 },
      { id: 'b', label: 'B', x: 40, y: 220 },
      { id: 'c', label: 'C', x: 40, y: 320 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 180,
        target: true,
        targetRows: rows(0, 0, 0, 0, 0, 0, 0, 1),
      },
    ],
    allowedGates: ['NAND'],
    maxGates: 6,
    timeLimit: 240,
    xpReward: 250,
    isBoss: true,
    hints: [
      'NAND is functionally complete — any gate can be built from it.',
      'NOT from NAND: connect both inputs together.',
      'AND from two NANDs: NAND → NOT each branch → NAND together.',
    ],
  },
  {
    id: 9,
    name: 'Cascade',
    description: 'Chain AND and OR — output when (A AND B) OR C.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 100 },
      { id: 'b', label: 'B', x: 40, y: 190 },
      { id: 'c', label: 'C', x: 40, y: 280 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 190,
        target: true,
        targetRows: rows(0, 1, 0, 1, 0, 1, 1, 1),
      },
    ],
    allowedGates: ['AND', 'OR', 'NOT'],
    maxGates: 4,
    timeLimit: 150,
    xpReward: 140,
    hints: [
      'Wire A and B into AND first.',
      'Feed AND output and C into OR.',
      'Test all input combos — solution must work for every row.',
    ],
  },
  {
    id: 10,
    name: 'Parity Check',
    description: 'Build a 2-bit parity detector: OUT=1 when exactly one input is ON.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 140 },
      { id: 'b', label: 'B', x: 40, y: 240 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 190,
        target: true,
        targetRows: rows(0, 1, 1, 0),
      },
    ],
    allowedGates: ['XOR', 'AND', 'OR', 'NOT', 'NAND'],
    maxGates: 4,
    timeLimit: 150,
    xpReward: 160,
    hints: ['XOR alone solves parity for two inputs.', 'Toggle inputs to verify all four cases.'],
  },
  {
    id: 11,
    name: 'Triple Matrix',
    description: 'Y1 = A AND B, Y2 = B OR C — satisfy both targets.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 90 },
      { id: 'b', label: 'B', x: 40, y: 180 },
      { id: 'c', label: 'C', x: 40, y: 270 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'Y1',
        x: 520,
        y: 130,
        target: true,
        targetRows: rows(0, 0, 0, 1, 0, 0, 0, 1),
      },
      {
        id: 'out2',
        label: 'Y2',
        x: 520,
        y: 250,
        target: true,
        targetRows: rows(0, 1, 0, 1, 0, 1, 1, 1),
      },
    ],
    allowedGates: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'],
    maxGates: 6,
    timeLimit: 200,
    xpReward: 180,
    hints: [
      'Split paths: one AND chain for Y1, one OR chain for Y2.',
      'Share gate B between both sub-circuits.',
    ],
  },
  {
    id: 12,
    name: 'BOSS: XOR Fortress',
    description: 'FINAL BOSS — Build (A XOR B) AND (NOT C) using any unlocked gates.',
    inputs: [
      { id: 'a', label: 'A', x: 40, y: 110 },
      { id: 'b', label: 'B', x: 40, y: 200 },
      { id: 'c', label: 'C', x: 40, y: 290 },
    ],
    outputs: [
      {
        id: 'out1',
        label: 'OUT',
        x: 520,
        y: 200,
        target: true,
        targetRows: rows(0, 0, 1, 0, 1, 0, 0, 0),
      },
    ],
    allowedGates: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'],
    maxGates: 7,
    timeLimit: 300,
    xpReward: 350,
    isBoss: true,
    hints: [
      'Compute A XOR B first, then NOT C, then AND them.',
      'Your circuit must pass every truth-table row.',
      'Use the truth table viewer to debug failing inputs.',
    ],
  },
]

export const LEVEL_COUNT = LEVELS.length

export function getLevelById(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id)
}

export function getDailyLevel(seed: number): Level {
  const index = seed % LEVELS.length
  const base = LEVELS[index]
  return {
    ...base,
    id: 900 + index,
    name: `Daily: ${base.name}`,
    xpReward: base.xpReward + 50,
  }
}

export const DEFAULT_UNLOCKED: GateType[] = ['AND', 'OR', 'NOT']
