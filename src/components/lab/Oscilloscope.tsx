import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { WaveformChannel } from '../../types'

interface OscilloscopeProps {
  channels: WaveformChannel[]
  running?: boolean
  sweepMs?: number
}

export function Oscilloscope({
  channels,
  running = true,
  sweepMs = 40,
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const maxSamples = Math.max(...channels.map((c) => c.samples.length), 1)

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, w, h)

      // grid
      ctx.strokeStyle = 'rgba(0,245,255,0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      const laneH = h / Math.max(channels.length, 1)

      channels.forEach((ch, ci) => {
        const yBase = laneH * ci + laneH / 2
        const samples = ch.samples
        if (samples.length < 2) return

        const offset = running ? phaseRef.current % samples.length : 0

        ctx.strokeStyle = ch.color
        ctx.shadowColor = ch.color
        ctx.shadowBlur = 8
        ctx.lineWidth = 2
        ctx.beginPath()

        for (let i = 0; i < w; i++) {
          const idx = (Math.floor((i / w) * samples.length) + offset) % samples.length
          const high = samples[idx] > 0.5
          const y = yBase + (high ? -laneH * 0.32 : laneH * 0.32)
          if (i === 0) ctx.moveTo(i, y)
          else ctx.lineTo(i, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.fillStyle = ch.color
        ctx.font = '10px Orbitron, sans-serif'
        ctx.fillText(ch.label, 6, yBase - laneH * 0.38)
      })

      // sweep line
      if (running) {
        const sweepX = (phaseRef.current / maxSamples) * w
        ctx.strokeStyle = 'rgba(255,0,170,0.6)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(sweepX % w, 0)
        ctx.lineTo(sweepX % w, h)
        ctx.stroke()
      }

      if (running) phaseRef.current += 0.4
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [channels, running])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-lg"
    >
      <div className="flex items-center justify-between border-b border-[#00f5ff]/20 px-3 py-2">
        <span className="font-display text-xs tracking-widest text-[#00f5ff] uppercase">
          ◈ Oscilloscope
        </span>
        <span className="flex items-center gap-2 text-[10px] text-white/40">
          <span
            className={`h-2 w-2 rounded-full ${running ? 'animate-pulse bg-[#39ff14]' : 'bg-white/30'}`}
          />
          {running ? 'LIVE' : 'PAUSED'} · {sweepMs}ms/div
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={560}
        height={channels.length > 2 ? 140 : 100}
        className="w-full"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="flex flex-wrap gap-3 border-t border-white/5 px-3 py-1.5">
        {channels.map((ch) => (
          <span key={ch.id} className="text-[10px]" style={{ color: ch.color }}>
            ▬ {ch.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
