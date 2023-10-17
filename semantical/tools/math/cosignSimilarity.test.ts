// cosineSimilarity.test.ts
import { cosineSimilarity } from './cosignSimilarity'

test('should calculate cosine similarity correctly', () => {
  expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1)
  expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0)
  expect(cosineSimilarity([1, 1], [1, 1])).toBeCloseTo(1)
  expect(cosineSimilarity([1, 2], [2, 4])).toBeCloseTo(1)
})