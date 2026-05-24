export function calcStars(
  elapsed: number,
  timeLimit: number,
  gateCount: number,
  maxGates: number,
): number {
  const timeRatio = elapsed / timeLimit
  const gateRatio = gateCount / maxGates

  let stars = 1
  if (timeRatio <= 0.5 && gateRatio <= 0.6) stars = 3
  else if (timeRatio <= 0.75 && gateRatio <= 0.85) stars = 2

  return stars
}

export function calcScore(
  stars: number,
  elapsed: number,
  xpReward: number,
  hintsUsed: number,
): number {
  const timeBonus = Math.max(0, 500 - elapsed * 2)
  const starMult = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1
  const hintPenalty = hintsUsed * 50
  return Math.round((xpReward + timeBonus) * starMult - hintPenalty)
}
