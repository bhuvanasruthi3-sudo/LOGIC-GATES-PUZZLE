import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StartupScreenProps {
  onComplete: () => void
}

export function StartupScreen({ onComplete }: StartupScreenProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => onComplete(), 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a12]">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent"
            style={{ top: `${(i + 1) * 5}%`, left: 0, right: 0 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0] }}
            transition={{ delay: i * 0.08, duration: 1.5, repeat: Infinity }}
          />
        ))}
      </div>

      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              className="mb-6 font-display text-6xl font-black tracking-[0.3em] text-[#00f5ff] md:text-8xl"
              initial={{ letterSpacing: '1em', opacity: 0 }}
              animate={{ letterSpacing: '0.15em', opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                textShadow:
                  '0 0 20px #00f5ff, 0 0 40px #00f5ff80, 0 0 80px #00f5ff40',
              }}
            >
              NEON
            </motion.div>

            {phase >= 2 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-lg tracking-[0.5em] text-[#ff00aa] md:text-2xl"
                style={{ textShadow: '0 0 15px #ff00aa' }}
              >
                LOGIC
              </motion.p>
            )}

            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12"
              >
                <motion.p
                  className="font-display text-sm tracking-widest text-[#39ff14] md:text-base"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ textShadow: '0 0 10px #39ff14' }}
                >
                  DIGITAL LOGIC SYSTEM INITIALIZED
                </motion.p>
                <div className="mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00f5ff] to-[#39ff14]"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
