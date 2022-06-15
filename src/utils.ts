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
