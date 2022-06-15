import { useEffect, useState } from 'react'

export const usePersist = <T,>(
  _key: string,
  initValue: T
): [T, (value: (prev: T) => T) => void] => {
  const key = `gather-auto-teleport-${_key}`

  const [savedValue, setSavedValue] = useState(initValue)

  useEffect(() => {
    try {
      chrome.storage.local.get(key, (items) => {
        const item = items[key]
        setSavedValue(item ?? initValue)
      })
    } catch (err) {}
  }, [])

  const setValue = (value: (prev: T) => T) => {
    const v = value(savedValue)
    chrome.storage.local.set(
      {
        [key]: v
      },
      () => {
        setSavedValue(value)
      }
    )
  }

  return [savedValue, setValue]
}
