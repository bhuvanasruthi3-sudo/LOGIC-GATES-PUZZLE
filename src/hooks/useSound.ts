import { useCallback, useRef } from 'react'

type SoundType = 'click' | 'wire' | 'success' | 'error' | 'toggle' | 'win' | 'hint'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.08) => {
      try {
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.value = freq
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration)
      } catch {
        /* audio unavailable */
      }
    },
    [getCtx],
  )

  const play = useCallback(
    (sound: SoundType) => {
      switch (sound) {
        case 'click':
          playTone(880, 0.05, 'square', 0.04)
          break
        case 'wire':
          playTone(440, 0.08, 'sine', 0.06)
          playTone(660, 0.06, 'sine', 0.04)
          break
        case 'toggle':
          playTone(520, 0.06, 'triangle', 0.05)
          break
        case 'success':
          playTone(523, 0.1, 'sine', 0.06)
          setTimeout(() => playTone(659, 0.1, 'sine', 0.06), 80)
          setTimeout(() => playTone(784, 0.15, 'sine', 0.06), 160)
          break
        case 'win':
          playTone(392, 0.12, 'sine', 0.07)
          setTimeout(() => playTone(494, 0.12, 'sine', 0.07), 100)
          setTimeout(() => playTone(587, 0.12, 'sine', 0.07), 200)
          setTimeout(() => playTone(784, 0.25, 'sine', 0.08), 300)
          break
        case 'error':
          playTone(200, 0.2, 'sawtooth', 0.05)
          break
        case 'hint':
          playTone(330, 0.15, 'triangle', 0.05)
          break
      }
    },
    [playTone],
  )

  return { play }
}
