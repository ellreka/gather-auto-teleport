import dayjs from 'dayjs'

export const ACTIONS = {
  GET_CURRENT_POSITION: 'GET_CURRENT_POSITION',
  TELEPORT: 'TELEPORT'
} as const

export const getTabId = async () => {
  const tabs = await chrome.tabs.query({})
  const targetTab = tabs.find((tab) => {
    if (tab.url == null) return false
    const url = new URL(tab.url)
    return url.hostname === 'app.gather.town'
  })
  return targetTab?.id ?? undefined
}

export const getNextDate = ({
  hour,
  minute,
  days
}: {
  hour: number
  minute: number
  days: number[]
}) => {
  const now = dayjs()
  let target = now
    .set('hour', hour)
    .set('minute', minute)
    .set('second', 0)
    .set('millisecond', 0)
  const nowDay = now.day()
  const daysList = days
    .map((d) => {
      if (d === nowDay) {
        if (target.set('day', d).diff(now) < 0) {
          return d + 7
        } else {
          return d
        }
      } else if (d < nowDay) {
        return d + 7
      } else {
        return d
      }
    })
    .sort((a, b) => a - b)
  target = target.set('day', daysList[0])

  const diff = target.diff(now)
  if (diff > 0) {
    return target
  } else {
    return target.set('day', daysList[1])
  }
}
