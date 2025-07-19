// Tennis score translation helpers

/**
 * Converts a score string like "6-4 0-6 7-6" to an array of arrays: [[6,4],[0,6],[7,6]]
 */
export function parseScoreString(scoreStr: string): number[][] {
  if (!scoreStr.trim()) return [];
  return scoreStr.trim().split(' ').map(set => set.split('-').map(Number));
}

/**
 * Converts an array of arrays like [[6,4],[0,6],[7,6]] to a score string: "6-4 0-6 7-6"
 */
export function scoreArrayToString(scoreArr: number[][]): string {
  return scoreArr.map(set => set.join('-')).join(' ');
}
