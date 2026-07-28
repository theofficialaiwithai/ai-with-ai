export function levelBandColor(level: number): string {
  if (level === 10) return '#CBFF4D'
  if (level >= 7) return '#FF4F70'
  if (level >= 4) return '#7C3AED'
  return '#1361E3'
}

// Stubbed until new level-project completion tracking is implemented
export async function getCurrentLevel(_userId: string): Promise<number> {
  return 0
}
