import { evaluateGate, getInputCount } from './gates'
import type {
  CircuitNode,
  CircuitState,
  Level,
  LevelOutput,
  SimulationResult,
  Wire,
} from '../types'

export function inputRowIndex(
  inputIds: string[],
  vals: Record<string, boolean>,
): number {
  const n = inputIds.length
  let idx = 0
  inputIds.forEach((id, bit) => {
    if (vals[id]) idx |= 1 << (n - 1 - bit)
  })
  return idx
}

export function getExpectedOutput(
  out: LevelOutput,
  rowIndex: number,
  inputCount: number,
): boolean {
  const rows = 1 << inputCount
  if (out.targetRows && out.targetRows.length === rows) {
    return out.targetRows[rowIndex]
  }
  return out.target
}

function buildAdjacency(state: CircuitState) {
  const wiresToInput = new Map<string, Wire[]>()
  const wiresFromOutput = new Map<string, Wire[]>()

  for (const wire of state.wires) {
    const inKey = `${wire.to.nodeId}:${wire.to.portIndex}`
    const outKey = `${wire.from.nodeId}:${wire.from.portIndex}`
    if (!wiresToInput.has(inKey)) wiresToInput.set(inKey, [])
    wiresToInput.get(inKey)!.push(wire)
    if (!wiresFromOutput.has(outKey)) wiresFromOutput.set(outKey, [])
    wiresFromOutput.get(outKey)!.push(wire)
  }

  return { wiresToInput, wiresFromOutput }
}

export function simulateCircuit(
  state: CircuitState,
  level?: Level,
): SimulationResult {
  const nodeValues: Record<string, boolean> = {}
  const wireActive: Record<string, boolean> = {}

  for (const node of state.nodes) {
    if (node.kind === 'input') {
      nodeValues[node.id] = node.value ?? false
    }
  }

  const { wiresToInput } = buildAdjacency(state)
  const maxIterations = state.nodes.length * 4
  let changed = true
  let iterations = 0

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    for (const node of state.nodes) {
      if (node.kind === 'input') continue

      if (node.kind === 'gate' && node.gateType) {
        const inputCount = getInputCount(node.gateType)
        const inputs: boolean[] = []
        for (let i = 0; i < inputCount; i++) {
          const key = `${node.id}:${i}`
          const incoming = wiresToInput.get(key) ?? []
          if (incoming.length === 0) {
            inputs.push(false)
          } else {
            const wire = incoming[0]
            const srcVal = nodeValues[wire.from.nodeId] ?? false
            wireActive[wire.id] = srcVal
            inputs.push(srcVal)
          }
        }
        const result = evaluateGate(node.gateType, inputs)
        if (nodeValues[node.id] !== result) {
          nodeValues[node.id] = result
          changed = true
        }
      }

      if (node.kind === 'output') {
        const key = `${node.id}:0`
        const incoming = wiresToInput.get(key) ?? []
        let val = false
        if (incoming.length > 0) {
          const wire = incoming[0]
          val = nodeValues[wire.from.nodeId] ?? false
          wireActive[wire.id] = val
        }
        if (nodeValues[node.id] !== val) {
          nodeValues[node.id] = val
          changed = true
        }
      }
    }
  }

  for (const wire of state.wires) {
    if (wireActive[wire.id] === undefined) {
      wireActive[wire.id] = nodeValues[wire.from.nodeId] ?? false
    }
  }

  let outputMatch = true
  if (level) {
    const inputIds = level.inputs.map((i) => i.id)
    const rowIdx = inputRowIndex(
      inputIds,
      Object.fromEntries(
        inputIds.map((id) => [id, nodeValues[id] ?? false]),
      ),
    )
    for (const out of level.outputs) {
      const actual = nodeValues[out.id] ?? false
      const expected = getExpectedOutput(out, rowIdx, inputIds.length)
      if (actual !== expected) {
        outputMatch = false
        break
      }
    }
  }

  return { nodeValues, wireActive, outputMatch }
}

/** Returns true only if outputs match targets for every input combination. */
export function validateLevelSolution(
  level: Level,
  placedGates: { id: string; type: import('../types').GateType; x: number; y: number }[],
  wires: Wire[],
): boolean {
  if (placedGates.length === 0) return false

  const inputIds = level.inputs.map((i) => i.id)
  const n = inputIds.length

  for (let i = 0; i < 1 << n; i++) {
    const inputVals: Record<string, boolean> = {}
    inputIds.forEach((id, bit) => {
      inputVals[id] = Boolean((i >> (n - 1 - bit)) & 1)
    })
    const circuit = buildLevelCircuit(level, inputVals, placedGates, wires)
    const sim = simulateCircuit(circuit, level)
    if (!sim.outputMatch) return false
  }

  return true
}

export function generateTruthTable(
  inputIds: string[],
  outputIds: string[],
  evaluate: (inputs: Record<string, boolean>) => Record<string, boolean>,
): { headers: string[]; rows: boolean[][] } {
  const n = inputIds.length
  const rows: boolean[][] = []
  const headers = [...inputIds.map((id) => id.toUpperCase()), ...outputIds.map((id) => id.toUpperCase())]

  for (let i = 0; i < 1 << n; i++) {
    const inputVals: Record<string, boolean> = {}
    inputIds.forEach((id, bit) => {
      inputVals[id] = Boolean((i >> (n - 1 - bit)) & 1)
    })
    const outputs = evaluate(inputVals)
    const row = [
      ...inputIds.map((id) => inputVals[id]),
      ...outputIds.map((id) => outputs[id] ?? false),
    ]
    rows.push(row)
  }

  return { headers, rows }
}

export function buildLevelCircuit(
  level: Level,
  inputValues: Record<string, boolean>,
  placedGates: { id: string; type: import('../types').GateType; x: number; y: number }[],
  wires: Wire[],
): CircuitState {
  const nodes: CircuitNode[] = [
    ...level.inputs.map((inp) => ({
      id: inp.id,
      kind: 'input' as const,
      x: inp.x,
      y: inp.y,
      label: inp.label,
      fixed: true,
      value: inputValues[inp.id] ?? false,
    })),
    ...level.outputs.map((out) => ({
      id: out.id,
      kind: 'output' as const,
      x: out.x,
      y: out.y,
      label: out.label,
      fixed: true,
    })),
    ...placedGates.map((g) => ({
      id: g.id,
      kind: 'gate' as const,
      gateType: g.type,
      x: g.x,
      y: g.y,
    })),
  ]

  return { nodes, wires }
}

export function getPortPosition(
  node: CircuitNode,
  portIndex: number,
  isOutput: boolean,
): { x: number; y: number } {
  const baseX = node.x
  const baseY = node.y
  const w = 80
  const h = 56

  if (node.kind === 'input') {
    return { x: baseX + w, y: baseY + h / 2 }
  }
  if (node.kind === 'output') {
    return { x: baseX, y: baseY + h / 2 }
  }

  const inputCount = node.gateType ? getInputCount(node.gateType) : 2
  if (isOutput) {
    return { x: baseX + w, y: baseY + h / 2 }
  }
  const spacing = h / (inputCount + 1)
  return { x: baseX, y: baseY + spacing * (portIndex + 1) }
}
