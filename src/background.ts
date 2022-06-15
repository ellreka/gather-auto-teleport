import { ACTIONS, getTabId } from './utils'

const key = 'gather-auto-teleport-list'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log(alarm)
  chrome.storage.local.get(key, async (items) => {
    const item = items[key]
    const data = item[Number(alarm.name)]
    const tabId = await getTabId()
    if (tabId != null) {
      chrome.tabs.sendMessage(tabId, { action: ACTIONS.TELEPORT, data })
    }
  })
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('installed')
  chrome.alarms.clearAll((wasCleared) => {
    if (wasCleared) console.log('cleared')
  })
  chrome.storage.local.set({ [key]: {} }, () => {
    console.log('added')
  })
})

export {}
