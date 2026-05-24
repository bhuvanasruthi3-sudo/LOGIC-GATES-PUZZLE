import type { Level, WaveformChannel } from '../types'
import { buildLevelCircuit, simulateCircuit } from './simulator'

const CHANNEL_COLORS = ['#00f5ff', '#ff00aa', '#39ff14', '#ffe600']

export function buildWaveforms(
  level: Level,
  placedGates: { id: string; type: import('../types').GateType; x: number; y: number }[],
  wires: import('../types').Wire[],
  steps = 64,
): WaveformChannel[] {
  const inputIds = level.inputs.map((i) => i.id)
  const outputIds = level.outputs.map((o) => o.id)
  const n = inputIds.length
  const rowCount = 1 << n

  const channels: WaveformChannel[] = []

  inputIds.forEach((id, idx) => {
    const samples: number[] = []
    for (let s = 0; s < steps; s++) {
      const row = Math.floor((s / steps) * rowCount) % rowCount
      const bit = Boolean((row >> (n - 1 - idx)) & 1)
      samples.push(bit ? 1 : 0)
    }
    channels.push({
      id,
      label: level.inputs.find((i) => i.id === id)?.label ?? id,
      color: CHANNEL_COLORS[idx % CHANNEL_COLORS.length],
      samples,
    })
  })

  outputIds.forEach((id, oidx) => {
    const samples: number[] = []
    for (let s = 0; s < steps; s++) {
      const row = Math.floor((s / steps) * rowCount) % rowCount
      const inputVals: Record<string, boolean> = {}
      inputIds.forEach((inpId, bit) => {
        inputVals[inpId] = Boolean((row >> (n - 1 - bit)) & 1)
      })
      const circuit = buildLevelCircuit(level, inputVals, placedGates, wires)
      const sim = simulateCircuit(circuit, level)
      samples.push(sim.nodeValues[id] ? 1 : 0)
    }
    channels.push({
      id,
      label: level.outputs.find((o) => o.id === id)?.label ?? 'OUT',
      color: CHANNEL_COLORS[(inputIds.length + oidx) % CHANNEL_COLORS.length],
      samples,
    })
  })

  return channels
}

export function buildLiveWaveform(
  _label: string,
  value: boolean,
  history: number[],
  maxLen = 80,
): number[] {
  const next = [...history, value ? 1 : 0]
  return next.slice(-maxLen)
}
