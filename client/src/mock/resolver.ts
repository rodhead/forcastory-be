// src/mock/resolver.ts
// Usage:  const data = await mockResolve(MOCK_PROJECTS)
// Simulates network delay so loading states are testable.

const MOCK_DELAY_MS = 400

export function mockResolve<T>(data: T, delayMs = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}

export function mockReject(message: string, delayMs = MOCK_DELAY_MS): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delayMs))
}
