import type { GateType } from '../../types'
import { GatePalette } from '../circuit/GatePalette'

interface MobileGameBarProps {
  allowedGates: GateType[]
  unlockedGates: GateType[]
  selectedGate: GateType | null
  onSelectGate: (type: GateType | null) => void
  onDragGate: (type: GateType) => void
  nandOnly?: boolean
  gateCount: number
  maxGates: number
}

export function MobileGameBar({
  allowedGates,
  unlockedGates,
  selectedGate,
  onSelectGate,
  onDragGate,
  nandOnly,
  gateCount,
  maxGates,
}: MobileGameBarProps) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#00f5ff]/30 bg-[#0a0a12]/95 p-3 backdrop-blur-md md:hidden">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-[#00f5ff]">Tap gate → tap board to place</span>
        <span className="text-white/50">
          {gateCount}/{maxGates}
        </span>
      </div>
      <GatePalette
        allowedGates={allowedGates}
        unlockedGates={unlockedGates}
        selectedGate={selectedGate}
        onSelectGate={onSelectGate}
        onDragGate={onDragGate}
        nandOnly={nandOnly}
      />
    </div>
  )
}
