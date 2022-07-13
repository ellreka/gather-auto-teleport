import { Data } from './types'
import { ACTIONS, getNextDate, getTabId, teleport } from './utils'

const key = 'gather-auto-teleport-list'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log(alarm)
  chrome.storage.local.get(key, async (items) => {
    const item = items[key]
    const data: Data = item[Number(alarm.name)]
    const tabId = await getTabId()
    if (tabId != null) {
      teleport(tabId, data, async ({ isOk }) => {
        if (isOk) {
          await chrome.tabs.update(tabId, { active: true })
        } else {
          console.error('teleport failed')
        }
      })
    } else {
      console.error('tab not found')
    }
    console.log(data)
    const { timer } = data
    if (timer == null || timer.hour == null || timer.minute == null) return
    if (!timer.days.length) return
    const target = getNextDate({
      hour: timer.hour,
      minute: timer.minute,
      days: timer.days
    })
    chrome.alarms.create(alarm.name, {
      when: target.valueOf()
    })
    chrome.alarms.get(alarm.name, (alarm) => {
      const date = new Date(alarm.scheduledTime)
      console.log('Next Date: ', date.toString())
    })
  })
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('installed')
  // chrome.alarms.clearAll((wasCleared) => {
  //   if (wasCleared) console.log('cleared')
  // })
  // chrome.storage.local.set({ [key]: {} }, () => {
  //   console.log('added')
  // })
})

export {}
