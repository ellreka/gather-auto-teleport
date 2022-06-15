export const ACTIONS = {
  GET_CURRENT_POSITION: 'GET_CURRENT_POSITION',
  TELEPORT: 'TELEPORT'
} as const

export const getTabId = async () => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  return tabs.length > 0 ? tabs[0].id : null
}
