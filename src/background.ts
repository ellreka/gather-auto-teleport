// import 'crx-hotreload'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request)
  return true
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'TEST') {
  }
})

chrome.runtime.onInstalled.addListener(function () {
  console.log('installed')
})

export {}
