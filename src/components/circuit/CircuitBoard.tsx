import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GateType, Level, PlacedGate, PortRef, Wire } from '../../types'
import {
  buildLevelCircuit,
  generateTruthTable,
  getExpectedOutput,
  inputRowIndex,
  simulateCircuit,
  validateLevelSolution,
} from '../../engine/simulator'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { DroppableBoard } from '../dnd/CircuitDndContext'
import { GateNode } from './GateNode'
import { WireLayer } from './WireLayer'
import { TruthTable } from './TruthTable'

const BOARD_W = 600
const BOARD_H = 400

interface CircuitBoardProps {
  level?: Level
  sandbox?: boolean
  allowedGates: GateType[]
  placedGates: PlacedGate[]
  wires: Wire[]
  inputValues: Record<string, boolean>
  selectedGateType: GateType | null
  onGatesChange: (gates: PlacedGate[]) => void
  onWiresChange: (wires: Wire[]) => void
  onInputToggle: (id: string) => void
  onVictory?: () => void
  maxGates?: number
  showTruthTable?: boolean
  signalPhase?: number
  boardRef?: React.RefObject<HTMLDivElement | null>
}

export function CircuitBoard({
  level,
  sandbox,
  allowedGates,
  placedGates,
  wires,
  inputValues,
  selectedGateType,
  onGatesChange,
  onWiresChange,
  onInputToggle,
  onVictory,
  maxGates = 99,
  showTruthTable = false,
  signalPhase = 0,
  boardRef: externalBoardRef,
}: CircuitBoardProps) {
  const internalBoardRef = useRef<HTMLDivElement>(null)
  const boardRef = externalBoardRef ?? internalBoardRef
  const isMobile = useIsMobile()
  const [connectingFrom, setConnectingFrom] = useState<PortRef | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [allRowsValid, setAllRowsValid] = useState(false)
  const victoryFired = useRef(false)

  const sandboxInputs = sandbox
    ? [
        { id: 'sa', label: 'A', x: 40, y: 120 },
        { id: 'sb', label: 'B', x: 40, y: 220 },
      ]
    : []
  const sandboxOutputs = sandbox
    ? [{ id: 'so', label: 'OUT', x: 520, y: 170, target: false }]
    : []

  const effectiveLevel = level ?? (sandbox ? {
    id: 0,
    name: 'Sandbox',
    description: '',
    inputs: sandboxInputs,
    outputs: sandboxOutputs.map((o) => ({ ...o, target: false })),
    allowedGates,
    maxGates: 99,
    timeLimit: 9999,
    xpReward: 0,
    hints: [],
  } : null)

  const circuit = useMemo(() => {
    if (!effectiveLevel) return { nodes: [], wires: [] }
    return buildLevelCircuit(effectiveLevel, inputValues, placedGates, wires)
  }, [effectiveLevel, inputValues, placedGates, wires])

  const simulation = useMemo(
    () => simulateCircuit(circuit, effectiveLevel ?? undefined),
    [circuit, effectiveLevel],
  )

  useEffect(() => {
    if (!level) {
      setAllRowsValid(false)
      return
    }
    const valid = validateLevelSolution(level, placedGates, wires)
    setAllRowsValid(valid)
    if (valid && !victoryFired.current) {
      victoryFired.current = true
      onVictory?.()
    }
    if (!valid) {
      victoryFired.current = false
    }
  }, [level, placedGates, wires, onVictory])

  const currentRowIndex = useMemo(() => {
    if (!effectiveLevel) return 0
    const ids = effectiveLevel.inputs.map((i) => i.id)
    return inputRowIndex(ids, inputValues)
  }, [effectiveLevel, inputValues])

  const handlePortClick = useCallback(
    (nodeId: string, portIndex: number, isOutput: boolean) => {
      if (!isOutput && connectingFrom) {
        const wire: Wire = {
          id: `w-${Date.now()}`,
          from: connectingFrom,
          to: { nodeId, portIndex },
        }
        const exists = wires.some(
          (w) =>
            w.from.nodeId === wire.from.nodeId &&
            w.from.portIndex === wire.from.portIndex &&
            w.to.nodeId === wire.to.nodeId &&
            w.to.portIndex === wire.to.portIndex,
        )
        if (!exists) onWiresChange([...wires, wire])
        setConnectingFrom(null)
        return
      }
      if (isOutput) {
        setConnectingFrom({ nodeId, portIndex })
      }
    },
    [connectingFrom, wires, onWiresChange],
  )

  const handleBoardDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = (e.dataTransfer.getData('gateType') ||
        selectedGateType) as GateType
      if (!type || !boardRef.current) return
      if (placedGates.length >= maxGates) return
      if (!allowedGates.includes(type)) return

      const rect = boardRef.current.getBoundingClientRect()
      const x = Math.max(80, Math.min(BOARD_W - 120, e.clientX - rect.left - 40))
      const y = Math.max(20, Math.min(BOARD_H - 80, e.clientY - rect.top - 28))

      onGatesChange([
        ...placedGates,
        { id: `g-${Date.now()}`, type, x, y },
      ])
    },
    [selectedGateType, placedGates, maxGates, allowedGates, onGatesChange],
  )

  const placeGateAt = useCallback(
    (clientX: number, clientY: number) => {
      if (!selectedGateType || !boardRef.current) return
      if (placedGates.length >= maxGates) return
      if (!allowedGates.includes(selectedGateType)) return

      const rect = boardRef.current.getBoundingClientRect()
      const x = clientX - rect.left - 40
      const y = clientY - rect.top - 28

      onGatesChange([
        ...placedGates,
        {
          id: `g-${Date.now()}`,
          type: selectedGateType,
          x: Math.max(80, Math.min(BOARD_W - 120, x)),
          y: Math.max(20, Math.min(BOARD_H - 80, y)),
        },
      ])
    },
    [selectedGateType, placedGates, maxGates, allowedGates, onGatesChange],
  )

  const handleBoardClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return
      placeGateAt(e.clientX, e.clientY)
    },
    [placeGateAt],
  )

  const handleDrag = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      if (!boardRef.current) return
      const startX = e.clientX
      const startY = e.clientY
      const gate = placedGates.find((g) => g.id === nodeId)
      if (!gate) return
      const origX = gate.x
      const origY = gate.y

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        onGatesChange(
          placedGates.map((g) =>
            g.id === nodeId
              ? {
                  ...g,
                  x: Math.max(80, Math.min(BOARD_W - 120, origX + dx)),
                  y: Math.max(20, Math.min(BOARD_H - 80, origY + dy)),
                }
              : g,
          ),
        )
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [placedGates, onGatesChange],
  )

  const truthTable = useMemo(() => {
    if (!showTruthTable || !effectiveLevel) return null
    const inputIds = effectiveLevel.inputs.map((i) => i.id)
    const outputIds = effectiveLevel.outputs.map((o) => o.id)
    if (inputIds.length === 0 || outputIds.length === 0) return null

    return generateTruthTable(inputIds, outputIds, (inputs) => {
      const c = buildLevelCircuit(effectiveLevel, inputs, placedGates, wires)
      const sim = simulateCircuit(c, effectiveLevel)
      const out: Record<string, boolean> = {}
      outputIds.forEach((id) => {
        out[id] = sim.nodeValues[id] ?? false
      })
      return out
    })
  }, [showTruthTable, effectiveLevel, placedGates, wires])

  const deleteSelected = () => {
    if (!selectedNodeId) return
    onGatesChange(placedGates.filter((g) => g.id !== selectedNodeId))
    onWiresChange(
      wires.filter(
        (w) =>
          w.from.nodeId !== selectedNodeId && w.to.nodeId !== selectedNodeId,
      ),
    )
    setSelectedNodeId(null)
  }

  return (
    <div className="space-y-3">
      {level && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-display ${
              allRowsValid
                ? 'bg-[#39ff14]/20 text-[#39ff14]'
                : simulation.outputMatch
                  ? 'bg-[#00f5ff]/20 text-[#00f5ff]'
                  : 'bg-white/10 text-white/50'
            }`}
          >
            {allRowsValid
              ? '✓ All input combos pass'
              : simulation.outputMatch
                ? 'Current inputs OK — test all combos'
                : 'Adjust inputs or wiring'}
          </span>
        </div>
      )}

      <div className="circuit-scroll -mx-1 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1">
        <DroppableBoard id="circuit-board">
        <div
          ref={boardRef}
          className="relative grid-bg overflow-hidden rounded-xl border border-[#00f5ff]/20 bg-[#0a0a12]/80 touch-pan-x"
          style={{
            width: BOARD_W,
            height: BOARD_H,
            minWidth: BOARD_W,
            touchAction: 'pan-x',
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleBoardDrop}
          onClick={handleBoardClick}
        >
        <WireLayer
          wires={wires}
          nodes={circuit.nodes}
          wireActive={simulation.wireActive}
          width={BOARD_W}
          height={BOARD_H}
          signalPhase={signalPhase}
        />

        {circuit.nodes.map((node) => (
          <div
            key={node.id}
            onClick={(e) => {
              e.stopPropagation()
              if (node.kind === 'gate') setSelectedNodeId(node.id)
            }}
          >
            <GateNode
              node={node}
              value={simulation.nodeValues[node.id]}
              expected={
                node.kind === 'output' && level
                  ? (() => {
                      const out = level.outputs.find((o) => o.id === node.id)
                      return out
                        ? getExpectedOutput(out, currentRowIndex, level.inputs.length)
                        : undefined
                    })()
                  : undefined
              }
              largeTouch={isMobile}
              selected={selectedNodeId === node.id}
              onPortClick={handlePortClick}
              onDragStart={node.kind === 'gate' ? handleDrag : undefined}
              onToggle={node.kind === 'input' ? onInputToggle : undefined}
              connectingFrom={connectingFrom}
            />
          </div>
        ))}

        {level &&
          level.outputs.map((out) => {
            const expected = getExpectedOutput(
              out,
              currentRowIndex,
              level.inputs.length,
            )
            const actual = simulation.nodeValues[out.id]
            return (
              <div
                key={`target-${out.id}`}
                className="absolute rounded px-2 py-0.5 text-[10px] font-display"
                style={{
                  left: out.x + 88,
                  top: out.y + 18,
                  color: actual === expected ? '#39ff14' : '#ff6b35',
                }}
              >
                TARGET: {expected ? '1' : '0'}
              </div>
            )
          })}

        {connectingFrom && (
          <p className="absolute bottom-2 left-2 text-xs text-[#00f5ff] animate-pulse">
            Tap an input port to connect →
          </p>
        )}
        </div>
        </DroppableBoard>
      </div>

      {connectingFrom && (
        <button
          type="button"
          className="font-display text-xs text-[#ff00aa] underline touch-manipulation"
          onClick={() => setConnectingFrom(null)}
        >
          Cancel wiring
        </button>
      )}

      <div className="hidden flex-wrap gap-2 text-xs text-white/50 md:flex">
        <span>Output port → input port to wire</span>
        <span>|</span>
        <span>Select gate, tap board to place</span>
        {selectedNodeId && (
          <button
            type="button"
            className="text-[#ff00aa] hover:underline touch-manipulation"
            onClick={deleteSelected}
          >
            Delete selected gate
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/50 md:hidden">
        <span>Swipe board • Tap ports to wire • Tap gate then board</span>
        {selectedNodeId && (
          <button
            type="button"
            className="text-[#ff00aa] touch-manipulation"
            onClick={deleteSelected}
          >
            Delete gate
          </button>
        )}
      </div>

      {truthTable && <TruthTable headers={truthTable.headers} rows={truthTable.rows} />}
    </div>
  )
}
