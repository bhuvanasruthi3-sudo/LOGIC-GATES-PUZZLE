export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR'

export type Screen =
  | 'startup'
  | 'hub'
  | 'campaign'
  | 'game'
  | 'lab'
  | 'procedural'
  | 'multiplayer'
  | 'sandbox'
  | 'tutorial'
  | 'daily'

export type NodeKind = 'input' | 'output' | 'gate'

export interface PortRef {
  nodeId: string
  portIndex: number
}

export interface Wire {
  id: string
  from: PortRef
  to: PortRef
}

export interface CircuitNode {
  id: string
  kind: NodeKind
  gateType?: GateType
  x: number
  y: number
  label?: string
  fixed?: boolean
  value?: boolean
}

export interface PlacedGate {
  id: string
  type: GateType
  x: number
  y: number
}

export interface CircuitState {
  nodes: CircuitNode[]
  wires: Wire[]
  placedGates?: PlacedGate[]
}

export interface LevelInput {
  id: string
  label: string
  x: number
  y: number
}

export interface LevelOutput {
  id: string
  label: string
  x: number
  y: number
  target: boolean
  targetRows?: boolean[]
}

export interface Level {
  id: number
  name: string
  description: string
  inputs: LevelInput[]
  outputs: LevelOutput[]
  allowedGates: GateType[]
  maxGates: number
  timeLimit: number
  xpReward: number
  hints: string[]
  isBoss?: boolean
  isProcedural?: boolean
  seed?: number
}

export interface LevelProgress {
  completed: boolean
  stars: number
  bestTime: number | null
  bestScore: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpBonus: number
}

export interface SavedCircuit {
  id: string
  name: string
  createdAt: number
  state: CircuitState
}

export interface DailyChallenge {
  date: string
  levelId: number
  completed: boolean
  seed: number
}

export interface ChallengeRecord {
  code: string
  playerName: string
  timeSeconds: number
  score: number
  completedAt: number
}

export interface MultiplayerChallenge {
  id: string
  code: string
  hostName: string
  levelSeed: number
  createdAt: number
  records: ChallengeRecord[]
}

export interface ProceduralStats {
  completed: number
  bestStreak: number
  currentStreak: number
  lastSeed: number | null
}

export interface GameSave {
  xp: number
  unlockedGates: GateType[]
  achievements: string[]
  levelProgress: Record<number, LevelProgress>
  dailyChallenge: DailyChallenge | null
  savedCircuits: SavedCircuit[]
  totalPlayTime: number
  hintsUsed: number
  procedural: ProceduralStats
  challenges: MultiplayerChallenge[]
  labVisits: number
}

export interface SimulationResult {
  nodeValues: Record<string, boolean>
  wireActive: Record<string, boolean>
  outputMatch: boolean
}

export interface WaveformChannel {
  id: string
  label: string
  color: string
  samples: number[]
}
