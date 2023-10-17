// euclideanDistance.test.ts
import { euclideanDistance } from './euclideanDistance'

test('should calculate euclidean distance correctly', () => {
  expect(euclideanDistance([1, 0], [1, 0])).toBe(0)
  expect(euclideanDistance([0, 0], [0, 1])).toBe(1)
  expect(euclideanDistance([0, 0], [1, 1])).toBe(Math.sqrt(2))
  expect(euclideanDistance([1, 1], [2, 2])).toBe(Math.sqrt(2))
})