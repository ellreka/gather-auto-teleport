import { describe, expect, it, beforeEach } from 'vitest'
import { getNextDate } from '../utils'
import MockDate from 'mockdate'

beforeEach(() => {
  MockDate.set(new Date('2022-6-21 15:00')) // Tuesday, June 21, 2022 3:00:00 PM
})

describe('getNextDate', () => {
  it('①', () => {
    const result = getNextDate({ hour: 13, minute: 0, days: [1, 2, 3, 4, 5] })

    expect(result.format('YYYY-MM-DD dddd HH:mm')).toBe(
      '2022-06-22 Wednesday 13:00'
    )
  })

  it('②', () => {
    const result = getNextDate({ hour: 13, minute: 0, days: [2] })

    expect(result.format('YYYY-MM-DD dddd HH:mm')).toBe(
      '2022-06-28 Tuesday 13:00'
    )
  })

  it('③', () => {
    const result = getNextDate({ hour: 15, minute: 1, days: [1, 2, 3, 4, 5] })

    expect(result.format('YYYY-MM-DD dddd HH:mm')).toBe(
      '2022-06-21 Tuesday 15:01'
    )
  })

  it('④', () => {
    const result = getNextDate({ hour: 14, minute: 59, days: [1, 2, 3, 4, 5] })

    expect(result.format('YYYY-MM-DD dddd HH:mm')).toBe(
      '2022-06-22 Wednesday 14:59'
    )
  })
})
