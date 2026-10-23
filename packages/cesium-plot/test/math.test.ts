import { describe, expect, it } from 'vitest'
import { UUID } from '../src/utils/math'

describe('UUID', () => {
  it('生成符合 UUID 格式的字符串', () => {
    expect(UUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('每次生成都不同', () => {
    const ids = new Set(Array.from({ length: 100 }, () => UUID()))
    expect(ids.size).toBe(100)
  })
})
