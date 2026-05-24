import { useEffect, useState } from 'react'
import { ALL_GATES } from '../../engine/gates'
import { useGame } from '../../context/GameContext'
import { PlatformShell } from '../layout/PlatformShell'
import { CircuitWorkbench } from '../lab/CircuitWorkbench'
import { NeonButton } from '../ui/NeonButton'
import type { GateType, PlacedGate, Wire } from '../../types'

export function LabScreen() {
  const { save, isGateUnlocked, saveCircuit, unlockAchievement, incrementLabVisit } = useGame()
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([])
  const [wires, setWires] = useState<Wire[]>([])
  const [inputValues, setInputValues] = useState({ sa: false, sb: false })
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null)
  const [name, setName] = useState('Lab Circuit')
  const [loadId, setLoadId] = useState('')

  const unlocked = ALL_GATES.filter(isGateUnlocked)

  useEffect(() => {
    incrementLabVisit()
    if (save.labVisits === 0) unlockAchievement('lab_init')
  }, [])

  const handleSave = () => {
    saveCircuit(name, {
      nodes: [],
      wires,
      placedGates,
    })
    unlockAchievement('sandbox_architect')
  }

  const handleLoad = () => {
    const c = save.savedCircuits.find((x) => x.id === loadId)
    if (!c) return
    const gates =
      c.state.placedGates ??
      c.state.nodes
        .filter((n) => n.kind === 'gate' && n.gateType)
        .map((n) => ({ id: n.id, type: n.gateType!, x: n.x, y: n.y }))
    setPlacedGates(gates)
    setWires(c.state.wires)
  }

  return (
    <PlatformShell
      title="Digital Electronics Lab"
      subtitle="Oscilloscope · Truth Table · Drag-and-Drop Canvas"
    >
      <CircuitWorkbench
        sandbox
        allowedGates={unlocked}
        unlockedGates={unlocked}
        placedGates={placedGates}
        wires={wires}
        inputValues={inputValues}
        selectedGate={selectedGate}
        onGatesChange={setPlacedGates}
        onWiresChange={setWires}
        onInputToggle={(id) =>
          setInputValues((p) => ({ ...p, [id]: !p[id as keyof typeof p] }))
        }
        onSelectGate={setSelectedGate}
        showScopeDefault
        showTruthDefault
        sidebar={
          <div className="glass-panel space-y-2 rounded-lg p-3 text-sm">
            <p className="text-xs text-[#00f5ff]">PERSISTENCE</p>
            <input
              className="w-full rounded border border-white/20 bg-black/50 px-2 py-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <NeonButton size="sm" className="w-full" onClick={handleSave}>
              Save to Local Storage
            </NeonButton>
            <select
              className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white"
              value={loadId}
              onChange={(e) => setLoadId(e.target.value)}
            >
              <option value="">Load circuit…</option>
              {save.savedCircuits.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <NeonButton size="sm" variant="ghost" className="w-full" onClick={handleLoad} disabled={!loadId}>
              Load
            </NeonButton>
          </div>
        }
      />
    </PlatformShell>
  )
}
