// euclideanDistance.ts
export const euclideanDistance = (vectorA: number[], vectorB: number[]): number => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length')
  }

  let sum = 0
  for (let i = 0; i < vectorA.length; i++) {
    sum += Math.pow(vectorA[i] - vectorB[i], 2)
  }

  return Math.sqrt(sum)
}
