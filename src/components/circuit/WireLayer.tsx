import { motion } from 'framer-motion'
import { getPortPosition } from '../../engine/simulator'
import type { CircuitNode, Wire } from '../../types'

interface WireLayerProps {
  wires: Wire[]
  nodes: CircuitNode[]
  wireActive: Record<string, boolean>
  width: number
  height: number
  signalPhase?: number
}

export function WireLayer({
  wires,
  nodes,
  wireActive,
  width,
  height,
  signalPhase = 0,
}: WireLayerProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="wire-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {wires.map((wire) => {
        const fromNode = nodeMap.get(wire.from.nodeId)
        const toNode = nodeMap.get(wire.to.nodeId)
        if (!fromNode || !toNode) return null

        const from = getPortPosition(fromNode, wire.from.portIndex, true)
        const to = getPortPosition(toNode, wire.to.portIndex, false)
        const active = wireActive[wire.id] ?? false
        const midX = (from.x + to.x) / 2

        const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`

        return (
          <g key={wire.id}>
            <motion.path
              d={path}
              fill="none"
              stroke={active ? '#39ff14' : '#2a4a6a'}
              strokeWidth={active ? 3 : 2}
              filter={active ? 'url(#wire-glow)' : undefined}
              initial={false}
              animate={{
                strokeOpacity: active ? [0.7, 1, 0.7] : 0.5,
              }}
              transition={
                active
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : {}
              }
            />
            {active &&
              [0, 0.35, 0.7].map((delay) => (
                <motion.circle
                  key={`${wire.id}-${delay}`}
                  r={3 + (signalPhase % 3)}
                  fill="#39ff14"
                  filter="url(#wire-glow)"
                  initial={{ offsetDistance: `${delay * 100}%` }}
                  animate={{ offsetDistance: '100%' }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: delay * 0.3,
                  }}
                  style={{ offsetPath: `path('${path}')` }}
                />
              ))}
            {active && (
              <motion.path
                d={path}
                fill="none"
                stroke="#00f5ff"
                strokeWidth={1}
                strokeDasharray="4 8"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -24 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                opacity={0.5}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
