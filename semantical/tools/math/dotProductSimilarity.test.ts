// dotProductSimilarity.test.ts
import { dotProductSimilarity } from '@/tools/math/dotProductSimilarity'

test('should calculate dot product correctly', () => {
  expect(dotProductSimilarity([1, 0], [1, 0])).toBe(1)
  expect(dotProductSimilarity([1, 0], [0, 1])).toBe(0)
  expect(dotProductSimilarity([1, 1], [1, 1])).toBe(2)
  expect(dotProductSimilarity([1, 2], [2, 4])).toBe(9)
})