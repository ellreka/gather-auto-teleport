import dayjs from 'dayjs'
import { Data } from './types'

export const ACTIONS = {
  GET_CURRENT_POSITION: 'GET_CURRENT_POSITION',
  TELEPORT: 'TELEPORT'
} as const

export const getTabId = async () => {
  const tabs = await chrome.tabs.query({ url: 'https://app.gather.town/app/*' })
  const tab = tabs.find((tab) => {
    if (tab.url != null) {
      const url = new URL(tab.url)
      return url.pathname.match(/app\/.+/)
    }
  })
  return tab?.id ?? undefined
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

export const teleport = (
  tabId: number,
  data: Data,
  callback: (response: { isOk: boolean }) => void
) => {
  console.log('teleport');
    chrome.tabs.sendMessage(
      tabId,
      { action: ACTIONS.TELEPORT, data },
      (response) => callback({ isOk: response != null })
    )
}
