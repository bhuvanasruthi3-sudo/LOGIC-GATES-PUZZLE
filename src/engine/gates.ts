import type { GateType } from '../types'

export const ALL_GATES: GateType[] = [
  'AND',
  'OR',
  'NOT',
  'XOR',
  'NAND',
  'NOR',
]

export const GATE_UNLOCK_XP: Record<GateType, number> = {
  AND: 0,
  OR: 0,
  NOT: 0,
  XOR: 150,
  NAND: 300,
  NOR: 450,
}

export const GATE_COLORS: Record<GateType, string> = {
  AND: '#00f5ff',
  OR: '#ff00aa',
  NOT: '#ffe600',
  XOR: '#39ff14',
  NAND: '#ff6b35',
  NOR: '#b388ff',
}

export function getInputCount(type: GateType): number {
  return type === 'NOT' ? 1 : 2
}

export function getOutputCount(_type: GateType): number {
  return 1
}

export function evaluateGate(type: GateType, inputs: boolean[]): boolean {
  const [a, b] = inputs
  switch (type) {
    case 'AND':
      return a && b
    case 'OR':
      return a || b
    case 'NOT':
      return !a
    case 'XOR':
      return a !== b
    case 'NAND':
      return !(a && b)
    case 'NOR':
      return !(a || b)
    default:
      return false
  }
}

export function gateLabel(type: GateType): string {
  return type
}
