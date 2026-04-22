import { describe, expect, it } from 'vitest'
import { createDonationRequestSchema } from '@altapens/api-contracts'

describe('createDonationRequestSchema', () => {
  it('accepts minimum 100 rub', () => {
    expect(createDonationRequestSchema.parse({ amountRub: 100 })).toEqual({ amountRub: 100 })
  })

  it('rejects below 100', () => {
    expect(() => createDonationRequestSchema.parse({ amountRub: 99 })).toThrow()
  })
})
