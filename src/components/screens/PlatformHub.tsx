import { motion } from 'framer-motion'
import { LEVEL_COUNT } from '../../data/levels'
import { useGame } from '../../context/GameContext'
import { dailySeed, proceduralSeed } from '../../utils/storage'
import { Dashboard } from '../ui/Dashboard'
import { NeonButton } from '../ui/NeonButton'
import { ShareChallenge } from '../ui/ShareChallenge'

const MODES = [
  {
    screen: 'campaign' as const,
    title: 'Campaign',
    desc: '12 story puzzles + boss gates. Earn XP and unlock components.',
    color: '#00f5ff',
    icon: '▶',
  },
  {
    screen: 'lab' as const,
    title: 'Digital Lab',
    desc: 'Free-build workbench with oscilloscope, truth table, and save slots.',
    color: '#ff00aa',
    icon: '⚗',
  },
  {
    screen: 'procedural' as const,
    title: 'Infinite Stream',
    desc: 'Procedurally generated logic challenges. How far can your streak go?',
    color: '#39ff14',
    icon: '∞',
  },
  {
    screen: 'multiplayer' as const,
    title: 'Versus Link',
    desc: 'Share a challenge code. Race friends async on identical circuits.',
    color: '#ffe600',
    icon: '⚔',
  },
]

export function PlatformHub() {
  const {
    setScreen,
    setCurrentLevelId,
    setProceduralSeed,
    setChallengeSeed,
    save,
    incrementLabVisit,
  } = useGame()

  const completed = Object.values(save.levelProgress).filter((p) => p.completed).length

  return (
    <div className="mx-auto min-h-screen max-w-5xl p-4 md:p-8">
      <Dashboard />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative my-8 overflow-hidden rounded-2xl border border-[#00f5ff]/30 p-8 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,245,255,0.08) 0%, rgba(255,0,170,0.06) 50%, rgba(10,10,18,0.95) 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px w-full bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent"
              style={{ top: `${(i + 1) * 12}%` }}
            />
          ))}
        </div>
        <p className="font-display mb-2 text-xs tracking-[0.4em] text-[#00f5ff]">
          ECE LEARNING PLATFORM v2.0
        </p>
        <h1 className="font-display text-4xl font-black md:text-6xl">
          <span className="neon-text-cyan">NEON</span>{' '}
          <span className="neon-text-magenta">LOGIC</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-white/60">
          Portal puzzles meet hacker sim meet digital electronics lab. Build circuits, read waveforms,
          dominate the campaign.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-white/40">
          <span>{completed}/{LEVEL_COUNT} campaign</span>
          <span>·</span>
          <span>{save.procedural.completed} infinite clears</span>
          <span>·</span>
          <span>streak {save.procedural.currentStreak}</span>
        </div>
      </motion.header>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((mode, i) => (
          <motion.button
            key={mode.screen}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              if (mode.screen === 'lab') incrementLabVisit()
              if (mode.screen === 'procedural') {
                setProceduralSeed(proceduralSeed())
                setCurrentLevelId(null)
              }
              setScreen(mode.screen)
            }}
            className="glass-panel group rounded-xl p-6 text-left transition-all hover:border-[#00f5ff]/50"
          >
            <span
              className="font-display text-3xl"
              style={{ color: mode.color, textShadow: `0 0 20px ${mode.color}` }}
            >
              {mode.icon}
            </span>
            <h2 className="font-display mt-3 text-xl font-bold text-white group-hover:text-[#00f5ff]">
              {mode.title}
            </h2>
            <p className="mt-2 text-sm text-white/50">{mode.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ShareChallenge />
        <div className="glass-panel flex flex-col justify-center gap-2 rounded-xl p-4">
          <NeonButton
            variant="magenta"
            onClick={() => {
              setScreen('daily')
              setCurrentLevelId(900 + (dailySeed() % LEVEL_COUNT))
            }}
          >
            Daily Challenge
          </NeonButton>
          <NeonButton
            variant="ghost"
            onClick={() => {
              const seed = proceduralSeed()
              setChallengeSeed(seed)
              setScreen('multiplayer')
            }}
          >
            Quick Versus Code
          </NeonButton>
          <NeonButton variant="ghost" onClick={() => setScreen('tutorial')}>
            Academy Tutorial
          </NeonButton>
        </div>
      </div>
    </div>
  )
}
