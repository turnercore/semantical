// dotProductSimilarity.ts
export const dotProductSimilarity = (vectorA: number[], vectorB: number[]): number => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length')
  }

  let dotProduct = 0
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
  }

  return dotProduct
}
