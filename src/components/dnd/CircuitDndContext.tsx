import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { GATE_COLORS } from '../../engine/gates'
import type { GateType } from '../../types'

interface CircuitDndContextProps {
  children: ReactNode
  onDropGate: (type: GateType, clientX: number, clientY: number) => void
  boardRef: React.RefObject<HTMLDivElement | null>
}

export function CircuitDndContext({
  children,
  onDropGate,
  boardRef,
}: CircuitDndContextProps) {
  const [activeType, setActiveType] = useState<GateType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  )

  const handleDragStart = (e: DragStartEvent) => {
    const type = e.active.data.current?.gateType as GateType | undefined
    if (type) setActiveType(type)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveType(null)
    const type = e.active.data.current?.gateType as GateType | undefined
    if (!type || !boardRef.current) return

    const rect = boardRef.current.getBoundingClientRect()
    const translated = e.active.rect.current.translated
    if (!translated) return

    const centerX = translated.left + translated.width / 2
    const centerY = translated.top + translated.height / 2

    if (
      centerX >= rect.left &&
      centerX <= rect.right &&
      centerY >= rect.top &&
      centerY <= rect.bottom
    ) {
      onDropGate(type, centerX, centerY)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay dropAnimation={null}>
        {activeType && (
          <motion.div
            className="font-display rounded-lg border-2 px-4 py-2 text-sm font-bold opacity-90"
            style={{
              borderColor: GATE_COLORS[activeType],
              color: GATE_COLORS[activeType],
              boxShadow: `0 0 24px ${GATE_COLORS[activeType]}80`,
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          >
            {activeType}
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export function DraggableGateChip({
  type,
  disabled,
  children,
}: {
  type: GateType
  disabled?: boolean
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `gate-${type}`,
    data: { gateType: type },
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-40' : ''}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  )
}

export function DroppableBoard({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-[#39ff14]/50 ring-offset-2 ring-offset-[#0a0a12]' : ''}
    >
      {children}
    </div>
  )
}
