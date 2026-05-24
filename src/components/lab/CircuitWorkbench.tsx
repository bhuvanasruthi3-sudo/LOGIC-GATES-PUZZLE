import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GateType, Level, PlacedGate, Wire } from '../../types'
import { buildWaveforms } from '../../engine/waveform'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useSound } from '../../hooks/useSound'
import { CircuitBoard } from '../circuit/CircuitBoard'
import { GatePalette } from '../circuit/GatePalette'
import { TruthTable } from '../circuit/TruthTable'
import { CircuitDndContext } from '../dnd/CircuitDndContext'
import { MobileGameBar } from '../ui/MobileGameBar'
import { NeonButton } from '../ui/NeonButton'
import { Oscilloscope } from './Oscilloscope'
import {
  buildLevelCircuit,
  generateTruthTable,
  simulateCircuit,
} from '../../engine/simulator'

interface CircuitWorkbenchProps {
  level?: Level
  sandbox?: boolean
  allowedGates: GateType[]
  unlockedGates: GateType[]
  placedGates: PlacedGate[]
  wires: Wire[]
  inputValues: Record<string, boolean>
  selectedGate: GateType | null
  onGatesChange: (gates: PlacedGate[]) => void
  onWiresChange: (wires: Wire[]) => void
  onInputToggle: (id: string) => void
  onSelectGate: (g: GateType | null) => void
  onVictory?: () => void
  maxGates?: number
  nandOnly?: boolean
  showTruthDefault?: boolean
  showScopeDefault?: boolean
  header?: React.ReactNode
  sidebar?: React.ReactNode
}

export function CircuitWorkbench({
  level,
  sandbox,
  allowedGates,
  unlockedGates,
  placedGates,
  wires,
  inputValues,
  selectedGate,
  onGatesChange,
  onWiresChange,
  onInputToggle,
  onSelectGate,
  onVictory,
  maxGates = 99,
  nandOnly,
  showTruthDefault = false,
  showScopeDefault = true,
  header,
  sidebar,
}: CircuitWorkbenchProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { play } = useSound()
  const [showTruth, setShowTruth] = useState(showTruthDefault)
  const [showScope, setShowScope] = useState(showScopeDefault)
  const [signalTick, setSignalTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSignalTick((t) => t + 1), 120)
    return () => clearInterval(id)
  }, [])

  const effectiveLevel = useMemo(() => {
    if (level) return level
    if (!sandbox) return undefined
    return {
      id: 0,
      name: 'Lab',
      description: '',
      inputs: [
        { id: 'sa', label: 'A', x: 40, y: 120 },
        { id: 'sb', label: 'B', x: 40, y: 220 },
      ],
      outputs: [{ id: 'so', label: 'OUT', x: 520, y: 170, target: false }],
      allowedGates,
      maxGates: 99,
      timeLimit: 9999,
      xpReward: 0,
      hints: [],
    } as Level
  }, [level, sandbox, allowedGates])

  const waveforms = useMemo(() => {
    if (!effectiveLevel || !showScope) return []
    return buildWaveforms(effectiveLevel, placedGates, wires, 96)
  }, [effectiveLevel, placedGates, wires, showScope, signalTick])

  const truthTable = useMemo(() => {
    if (!showTruth || !effectiveLevel) return null
    const inputIds = effectiveLevel.inputs.map((i) => i.id)
    const outputIds = effectiveLevel.outputs.map((o) => o.id)
    return generateTruthTable(inputIds, outputIds, (inputs) => {
      const c = buildLevelCircuit(effectiveLevel, inputs, placedGates, wires)
      const sim = simulateCircuit(c, effectiveLevel)
      const out: Record<string, boolean> = {}
      outputIds.forEach((id) => {
        out[id] = sim.nodeValues[id] ?? false
      })
      return out
    })
  }, [showTruth, effectiveLevel, placedGates, wires])

  const handleDropGate = useCallback(
    (type: GateType, clientX: number, clientY: number) => {
      if (!boardRef.current) return
      if (placedGates.length >= maxGates) return
      if (!allowedGates.includes(type)) return
      const rect = boardRef.current.getBoundingClientRect()
      const x = Math.max(80, Math.min(520, clientX - rect.left - 40))
      const y = Math.max(20, Math.min(360, clientY - rect.top - 28))
      onGatesChange([...placedGates, { id: `g-${Date.now()}`, type, x, y }])
      play('click')
    },
    [placedGates, maxGates, allowedGates, onGatesChange, play],
  )

  return (
    <CircuitDndContext onDropGate={handleDropGate} boardRef={boardRef}>
      <div className={`space-y-4 ${isMobile ? 'pb-36' : ''}`}>
        {header}

        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <CircuitBoard
                boardRef={boardRef}
                level={level}
                sandbox={sandbox}
                allowedGates={allowedGates}
                placedGates={placedGates}
                wires={wires}
                inputValues={inputValues}
                selectedGateType={selectedGate}
                onGatesChange={onGatesChange}
                onWiresChange={(w) => {
                  onWiresChange(w)
                  play('wire')
                }}
                onInputToggle={(id) => {
                  onInputToggle(id)
                  play('toggle')
                }}
                onVictory={onVictory}
                maxGates={maxGates}
                showTruthTable={false}
                signalPhase={signalTick % 20}
              />
            </div>

            {showScope && waveforms.length > 0 && (
              <Oscilloscope channels={waveforms} running />
            )}

            {truthTable && (
              <TruthTable headers={truthTable.headers} rows={truthTable.rows} />
            )}
          </div>

          <div className="hidden w-64 shrink-0 space-y-3 xl:block">
            <div className="glass-panel rounded-lg p-3">
              <p className="font-display mb-2 text-xs tracking-widest text-[#00f5ff] uppercase">
                Component Tray
              </p>
              <GatePalette
                allowedGates={allowedGates}
                unlockedGates={unlockedGates}
                selectedGate={selectedGate}
                onSelectGate={onSelectGate}
                onDragGate={onSelectGate}
                nandOnly={nandOnly}
                useDnd
              />
              <p className="mt-2 text-[10px] text-white/40">
                Drag chips onto the canvas or select + click
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <NeonButton size="sm" variant="ghost" onClick={() => setShowScope((s) => !s)}>
                {showScope ? 'Hide' : 'Show'} Oscilloscope
              </NeonButton>
              <NeonButton size="sm" variant="ghost" onClick={() => setShowTruth((s) => !s)}>
                {showTruth ? 'Hide' : 'Show'} Truth Table
              </NeonButton>
              <NeonButton
                size="sm"
                variant="ghost"
                onClick={() => {
                  onGatesChange([])
                  onWiresChange([])
                }}
              >
                Clear Canvas
              </NeonButton>
            </div>

            {sidebar}
          </div>
        </div>

        {isMobile && (
          <MobileGameBar
            allowedGates={allowedGates}
            unlockedGates={unlockedGates}
            selectedGate={selectedGate}
            onSelectGate={onSelectGate}
            onDragGate={onSelectGate}
            nandOnly={nandOnly}
            gateCount={placedGates.length}
            maxGates={maxGates}
          />
        )}
      </div>
    </CircuitDndContext>
  )
}
