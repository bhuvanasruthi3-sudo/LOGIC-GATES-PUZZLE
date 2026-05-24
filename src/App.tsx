import { AnimatePresence } from 'framer-motion'
import { useCallback, useState } from 'react'
import { ParticleBackground } from './components/ui/ParticleBackground'
import { GameScreen } from './components/screens/GameScreen'
import { LabScreen } from './components/screens/LabScreen'
import { LevelSelect } from './components/screens/LevelSelect'
import { MultiplayerScreen } from './components/screens/MultiplayerScreen'
import { PlatformHub } from './components/screens/PlatformHub'
import { ProceduralScreen } from './components/screens/ProceduralScreen'
import { StartupScreen } from './components/screens/StartupScreen'
import { TutorialOverlay } from './components/screens/TutorialOverlay'
import { GameProvider, useGame } from './context/GameContext'

function AppRoutes() {
  const { screen, setScreen } = useGame()
  const [booted, setBooted] = useState(false)

  const handleStartupComplete = useCallback(() => {
    setBooted(true)
    setScreen('hub')
  }, [setScreen])

  if (!booted) {
    return <StartupScreen onComplete={handleStartupComplete} />
  }

  return (
    <>
      <ParticleBackground />
      <div className="scanlines" aria-hidden />
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === 'hub' && <PlatformHub key="hub" />}
          {screen === 'campaign' && <LevelSelect key="campaign" />}
          {screen === 'lab' && <LabScreen key="lab" />}
          {screen === 'procedural' && <ProceduralScreen key="procedural" />}
          {screen === 'multiplayer' && <MultiplayerScreen key="multiplayer" />}
          {(screen === 'game' || screen === 'daily') && <GameScreen key="game" />}
          {screen === 'tutorial' && <TutorialOverlay key="tutorial" />}
        </AnimatePresence>
      </div>
    </>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppRoutes />
    </GameProvider>
  )
}
