import { motion } from 'framer-motion'
import { useMemo } from 'react'

export function ParticleBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 5,
        color:
          i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#ff00aa' : '#39ff14',
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]" />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.15) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
