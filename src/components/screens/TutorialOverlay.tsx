import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import { NeonButton } from '../ui/NeonButton'

const STEPS = [
  {
    title: 'Welcome, Architect',
    body: 'Build circuits by placing logic gates and connecting wires between ports.',
  },
  {
    title: 'Inputs & Outputs',
    body: 'Click input nodes to toggle 0/1. Match each output to its TARGET value.',
  },
  {
    title: 'Wiring',
    body: 'Click an output port (right side), then an input port (left side) to create a wire.',
  },
  {
    title: 'Gates',
    body: 'Drag gates from the palette or select one and click the board. AND, OR, NOT, XOR, NAND, NOR await you.',
  },
  {
    title: 'Earn XP',
    body: 'Complete levels fast with fewer gates for more stars and XP. Unlock advanced gates and beat the NAND boss!',
  },
]

export function TutorialOverlay() {
  const { setScreen, setTutorialSeen } = useGame()
  const [step, setStep] = useState(0)

  const finish = () => {
    setTutorialSeen(true)
    setScreen('hub')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="glass-panel w-full rounded-2xl p-8 text-center"
        >
          <p className="font-display mb-2 text-xs tracking-widest text-[#00f5ff]">
            TUTORIAL {step + 1}/{STEPS.length}
          </p>
          <h2 className="font-display mb-4 text-2xl font-bold text-white">
            {STEPS[step].title}
          </h2>
          <p className="mb-8 text-lg text-white/70">{STEPS[step].body}</p>

          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === step ? 'bg-[#00f5ff]' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <NeonButton variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </NeonButton>
        )}
        {step < STEPS.length - 1 ? (
          <NeonButton onClick={() => setStep((s) => s + 1)}>Next</NeonButton>
        ) : (
          <NeonButton variant="magenta" onClick={finish}>
            Start Playing
          </NeonButton>
        )}
        <NeonButton variant="ghost" size="sm" onClick={finish}>
          Skip
        </NeonButton>
      </div>
    </div>
  )
}
