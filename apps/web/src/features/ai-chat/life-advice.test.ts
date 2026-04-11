import { describe, expect, it } from 'vitest'
import { lifeAdviceReply } from '@/features/ai-chat/life-advice'

describe('lifeAdviceReply', () => {
  it('mentions non-diagnosis for side pain', () => {
    const r = lifeAdviceReply('У меня с утра тянет в левом боку')
    expect(r.toLowerCase()).toMatch(/врач|диагноз|не медицинское/)
    expect(r.length).toBeGreaterThan(40)
  })

  it('has fallback for generic question', () => {
    const r = lifeAdviceReply('Как дела')
    expect(r).toMatch(/врач|диагноз/i)
  })
})
