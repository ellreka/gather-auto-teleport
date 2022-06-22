import { Data } from './types'
import { ACTIONS, getNextDate, getTabId } from './utils'

const key = 'gather-auto-teleport-list'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log(alarm)
  chrome.storage.local.get(key, async (items) => {
    const item = items[key]
    const data: Data = item[Number(alarm.name)]
    const tabId = await getTabId()
    if (tabId != null) {
      chrome.tabs.sendMessage(tabId, { action: ACTIONS.TELEPORT, data })
      console.log(data)
      if (data.timer == null) return
      const target = getNextDate(data.timer)
      console.log(target.format())
      chrome.alarms.create(alarm.name, {
        when: target.valueOf()
      })
    }
  })
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('installed')
  chrome.alarms.clearAll((wasCleared) => {
    if (wasCleared) console.log('cleared')
  })
  // chrome.storage.local.set({ [key]: {} }, () => {
  //   console.log('added')
  // })
})

export {}
