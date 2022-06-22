import { ACTIONS } from './utils'

const head = document.head
const script = document.createElement('script')
script.src = chrome.runtime.getURL('content.js')
head.appendChild(script)

const fnc = (event: any) => {
  if (event.source != window) {
    return
  }
  if (event.data.type && event.data.type == 'FROM_CONTENT') {
    switch (event.data.action) {
      case ACTIONS.GET_CURRENT_POSITION:
        chrome.runtime.sendMessage({
          action: event.data.action,
          data: event.data.data
        })
        break
    }
  }
}

window.addEventListener('message', fnc, false)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  window.postMessage(
    { type: 'FROM_INJECT', action: request.action, data: request.data },
    '*'
  )
  sendResponse(request)
})

export {}
