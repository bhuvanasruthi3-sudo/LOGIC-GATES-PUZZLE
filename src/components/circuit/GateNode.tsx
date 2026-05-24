import { motion } from 'framer-motion'
import { GATE_COLORS, getInputCount } from '../../engine/gates'
import type { CircuitNode } from '../../types'

interface GateNodeProps {
  node: CircuitNode
  value?: boolean
  expected?: boolean
  selected?: boolean
  largeTouch?: boolean
  onPortClick?: (nodeId: string, portIndex: number, isOutput: boolean) => void
  onDragStart?: (nodeId: string, e: React.PointerEvent) => void
  onToggle?: (nodeId: string) => void
  connectingFrom?: { nodeId: string; portIndex: number } | null
}

export function GateNode({
  node,
  value = false,
  expected,
  selected,
  largeTouch,
  onPortClick,
  onDragStart,
  onToggle,
  connectingFrom,
}: GateNodeProps) {
  const isInput = node.kind === 'input'
  const isOutput = node.kind === 'output'
  const gateType = node.gateType
  const color = gateType ? GATE_COLORS[gateType] : isInput ? '#00f5ff' : '#ff00aa'
  const inputCount = gateType ? getInputCount(gateType) : isOutput ? 1 : 0

  const active = value
  const matchesExpected = expected === undefined || value === expected
  const glow = active
    ? `0 0 20px ${color}, 0 0 40px ${color}40`
    : `0 0 8px ${color}30`

  return (
    <motion.div
      className="absolute select-none touch-none"
      style={{ left: node.x, top: node.y, width: 80, height: 56 }}
      animate={
        active && !isInput
          ? { filter: [`drop-shadow(0 0 4px ${color})`, `drop-shadow(0 0 12px ${color})`] }
          : {}
      }
      transition={{ repeat: active ? Infinity : 0, duration: 1, repeatType: 'reverse' }}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center rounded-lg border-2 font-display text-sm font-bold tracking-wider ${selected ? 'ring-2 ring-white' : ''} ${isOutput && !matchesExpected ? 'border-[#ff6b35]' : ''}`}
        style={{
          borderColor: color,
          background: `linear-gradient(135deg, ${color}15 0%, #12121f 100%)`,
          boxShadow: glow,
          color,
        }}
        onPointerDown={(e) => {
          if (node.kind === 'gate' && onDragStart) {
            e.preventDefault()
            onDragStart(node.id, e)
          }
        }}
      >
        {isInput && (
          <button
            type="button"
            className="absolute inset-0 flex min-h-[44px] min-w-[44px] cursor-pointer flex-col items-center justify-center rounded-lg touch-manipulation"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onToggle?.(node.id)}
          >
            <span className="text-[10px] opacity-70">{node.label}</span>
            <span className="text-lg">{value ? '1' : '0'}</span>
          </button>
        )}
        {isOutput && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-70">{node.label}</span>
            <span className="text-lg">{value ? '1' : '0'}</span>
          </div>
        )}
        {gateType && <span>{gateType}</span>}
      </div>

      {gateType &&
        Array.from({ length: inputCount }, (_, i) => (
          <PortDot
            key={`in-${i}`}
            x={-6}
            y={(56 / (inputCount + 1)) * (i + 1) - 6}
            color={color}
            largeTouch={largeTouch}
            active={false}
            onClick={() => onPortClick?.(node.id, i, false)}
          />
        ))}
      {isOutput && (
        <PortDot
          x={-6}
          y={22}
          color={color}
          largeTouch={largeTouch}
          onClick={() => onPortClick?.(node.id, 0, false)}
        />
      )}

      {(gateType || isInput) && (
        <PortDot
          x={74}
          y={22}
          color={color}
          largeTouch={largeTouch}
          active={
            connectingFrom?.nodeId === node.id && connectingFrom.portIndex === 0
          }
          onClick={() => onPortClick?.(node.id, 0, true)}
          isOutput
        />
      )}
    </motion.div>
  )
}

function PortDot({
  x,
  y,
  color,
  active,
  onClick,
  isOutput,
  largeTouch,
}: {
  x: number
  y: number
  color: string
  active?: boolean
  onClick: () => void
  isOutput?: boolean
  largeTouch?: boolean
}) {
  const size = largeTouch ? 44 : 12
  const dot = largeTouch ? 14 : 12

  return (
    <button
      type="button"
      className="absolute z-10 flex cursor-crosshair items-center justify-center touch-manipulation"
      style={{
        left: x - (size - dot) / 2,
        top: y - (size - dot) / 2,
        width: size,
        height: size,
      }}
      title={isOutput ? 'Output port' : 'Input port'}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <span
        className="rounded-full border-2 transition-transform active:scale-125"
        style={{
          width: dot,
          height: dot,
          borderColor: color,
          background: active ? color : '#0a0a12',
          boxShadow: active ? `0 0 10px ${color}` : undefined,
        }}
      />
    </button>
  )
}
