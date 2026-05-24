import { motion } from 'framer-motion'
import { GATE_COLORS } from '../../engine/gates'
import type { GateType } from '../../types'
import { DraggableGateChip } from '../dnd/CircuitDndContext'

interface GatePaletteProps {
  allowedGates: GateType[]
  unlockedGates: GateType[]
  onDragGate: (type: GateType) => void
  selectedGate: GateType | null
  onSelectGate: (type: GateType | null) => void
  nandOnly?: boolean
  useDnd?: boolean
}

export function GatePalette({
  allowedGates,
  unlockedGates,
  onDragGate,
  selectedGate,
  onSelectGate,
  nandOnly,
  useDnd = false,
}: GatePaletteProps) {
  const gates = nandOnly ? (['NAND'] as GateType[]) : allowedGates

  return (
    <div className="flex flex-wrap gap-2">
      {gates.map((type) => {
        const unlocked = unlockedGates.includes(type)
        const color = GATE_COLORS[type]
        const selected = selectedGate === type

        const chip = (
          <button
            type="button"
            draggable={!useDnd && unlocked}
            disabled={!unlocked}
            onClick={() => {
              if (unlocked) onSelectGate(selected ? null : type)
            }}
            onDragStart={(e) => {
              if (!unlocked || useDnd) return
              e.dataTransfer.setData('gateType', type)
              onDragGate(type)
            }}
            className={`font-display w-full cursor-grab rounded-lg border-2 px-3 py-2 text-sm font-bold tracking-wider active:cursor-grabbing ${
              !unlocked ? 'cursor-not-allowed opacity-30' : ''
            } ${selected ? 'ring-2 ring-white' : ''}`}
            style={{
              borderColor: color,
              color,
              background: `${color}12`,
              boxShadow: selected ? `0 0 15px ${color}50` : undefined,
            }}
            title={unlocked ? `Drag or tap ${type}` : 'Locked — earn XP in campaign'}
          >
            {type}
            {!unlocked && ' 🔒'}
          </button>
        )

        return (
          <motion.div
            key={type}
            whileHover={unlocked ? { scale: 1.05 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            className="min-w-[4.5rem]"
          >
            {useDnd && unlocked ? (
              <DraggableGateChip type={type} disabled={!unlocked}>
                {chip}
              </DraggableGateChip>
            ) : (
              chip
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
