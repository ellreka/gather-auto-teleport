import { FC, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import {
  TrashIcon,
  PencilAltIcon,
  PlayIcon,
  PauseIcon,
  PlusCircleIcon,
  FlagIcon
} from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import { ACTIONS, getNextDate, getTabId } from './utils'
import dayjs from 'dayjs'
import clsx from 'clsx'
import { usePersist } from './hooks/usePersist'
import { Data } from './types'

const daysList = [0, 1, 2, 3, 4, 5, 6] as const

export function Popup() {
  const [list, setList] = usePersist<{
    [key: number]: Data
  }>('list', {})
  const [tmpData, setTmpData] = useState<Data | undefined>(undefined)
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [current, setCurrent] = useState<
    Pick<Data, 'mapId' | 'position'> | undefined
  >(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const onClick = async (data: Data) => {
    const tabId = await getTabId()
    if (tabId != null) {
      chrome.tabs.sendMessage(tabId, { action: ACTIONS.TELEPORT, data })
    }
  }

  const handleEdit = (id: number) => {
    setTmpData(undefined)
    setCurrent(undefined)
    setEditingId(id)
  }

  const handleDelete = (id: number) => {
    setList((prev) => {
      const cloneObj = Object.assign({}, prev)
      delete cloneObj[id]
      return cloneObj
    })
    clearTimer(id)
  }

  const handleSave = (id: number, data: Data) => {
    setTmpData(undefined)
    setEditingId(undefined)
    setCurrent(undefined)
    setList((prev) => {
      if (
        prev?.[id]?.timer?.hour !== data.timer?.hour ||
        prev?.[id]?.timer?.minute !== data.timer?.minute ||
        JSON.stringify(prev?.[id]?.timer?.days) !==
          JSON.stringify(data.timer?.days)
      ) {
        clearTimer(id)
        return {
          ...prev,
          [id === 0 ? Date.now() : id]: { ...data, isPlaying: false }
        }
      } else {
        return { ...prev, [id === 0 ? Date.now() : id]: data }
      }
    })
  }

  const handleCancel = () => {
    setTmpData(undefined)
    setEditingId(undefined)
    setCurrent(undefined)
  }

  const getCurrent = async () => {
    const tabId = await getTabId()
    if (tabId != null) {
      chrome.tabs.sendMessage(
        tabId,
        {
          action: ACTIONS.GET_CURRENT_POSITION,
          data: {}
        },
        (response) => {
          if (response == null) {
            setError('Could not connected. please reload gather.town.')
          } else {
            setError(undefined)
          }
        }
      )
    }
  }

  const handleAdd = async () => {
    setEditingId(undefined)
    setTmpData({
      name: '',
      mapId: '',
      position: {
        x: 0,
        y: 0
      },
      timer: {
        days: [1, 2, 3, 4, 5]
      },
      isPlaying: false
    })
    await getCurrent()
  }

  const startTimer = (id: number, timer: Data['timer']) => {
    if (timer == null || timer.hour == null || timer.minute == null) return
    if (!timer.days.length) return
    const name = String(id)

    const target = getNextDate({
      hour: timer.hour,
      minute: timer.minute,
      days: timer.days
    })
    console.log(target.format())
    chrome.alarms.create(name, {
      when: target.valueOf()
    })
    setList((prev) => {
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isPlaying: true
        }
      }
    })
  }

  const clearTimer = (id: number) => {
    const name = String(id)
    chrome.alarms.clear(name)
  }

  const stopTimer = (id: number) => {
    clearTimer(id)
    setList((prev) => {
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isPlaying: false
        }
      }
    })
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case ACTIONS.GET_CURRENT_POSITION:
          setCurrent({
            position: request.data.position,
            mapId: request.data.mapId
          })
          break
      }
      // return true
    })
  }, [])

  return (
    <div className="px-2 py-5 w-[520px] bg-neutral space-y-5">
      {error && <div className="text-error font-semibold text-sm">{error}</div>}
      <div className="w-full gap-3 flex flex-col">
        {Object.entries(list).map(([key, value]) => {
          const id = Number(key)
          const isEdit = editingId === id
          return (
            <Item
              key={`${id}_${isEdit}`}
              id={id}
              data={value}
              isEdit={isEdit}
              current={current}
              onClick={onClick}
              onEdit={() => handleEdit(id)}
              onDelete={() => handleDelete(id)}
              onSave={(data) => handleSave(id, data)}
              onCancel={() => handleCancel()}
              getCurrent={getCurrent}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
            />
          )
        })}
      </div>
      {tmpData != null ? (
        <Item
          key={0}
          id={0}
          data={tmpData}
          isEdit={true}
          current={current}
          onEdit={() => handleEdit(0)}
          onDelete={() => handleDelete(0)}
          onSave={(data) => handleSave(0, data)}
          onCancel={() => handleCancel()}
          getCurrent={getCurrent}
        />
      ) : (
        <button
          className="btn btn-block btn-outline gap-2"
          onClick={async () => {
            await getCurrent()
            handleAdd()
          }}>
          <PlusCircleIcon className="w-5 h-5" />
          Add
        </button>
      )}
    </div>
  )
}

type ItemProps = {
  id: number
  data: Data
  isEdit: boolean
  current: Pick<Data, 'mapId' | 'position'> | undefined
  onClick?: (data: Data) => void
  onEdit: () => void
  onDelete: () => void
  onSave: (data: Data) => void
  onCancel: () => void
  getCurrent: () => Promise<void>
  onStartTimer?: (id: number, timer: Data['timer']) => void
  onStopTimer?: (id: number) => void
}

const Item: FC<ItemProps> = ({
  id,
  data,
  isEdit,
  current,
  onClick,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  getCurrent,
  onStartTimer,
  onStopTimer
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    defaultValues: data
  })

  console.table(data)

  useEffect(() => {
    setValue('mapId', current?.mapId ?? data.mapId)
    setValue('position', current?.position ?? data.position)
  }, [current])

  const onSubmit = handleSubmit((data) => {
    onSave(data)
  })
  const handleClickCurrent = async () => {
    await getCurrent()
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  const handleSelectDay = (day: typeof daysList[number]) => {
    const s = new Set(watch('timer.days') ?? [])
    if (s.has(day)) {
      s.delete(day)
    } else {
      s.add(day)
    }
    const arr = Array.from(s).sort((a, b) => a - b)
    setValue('timer.days', arr)
  }
  return (
    <>
      {isEdit ? (
        <div key={id}>
          <div className="bg-base-100 text-neutral-content w-full flex items-center p-3 rounded-md border-neutral-content border">
            <div className="flex flex-col gap-2 w-full">
              <input
                type="text"
                placeholder="MTG"
                className="input input-bordered input-xs text-sm"
                {...register('name', { required: true, maxLength: 20 })}
              />
              <div className="text-sm">
                <span>X: </span>
                <input
                  type="number"
                  className="input input-bordered input-xs max-w-[6em]"
                  {...register('position.x', {
                    required: true,
                    valueAsNumber: true
                  })}
                />
                <span className="ml-3">Y: </span>
                <input
                  type="number"
                  className="input input-bordered input-xs max-w-[6em]"
                  {...register('position.y', {
                    required: true,
                    valueAsNumber: true
                  })}
                />
                <span className="ml-3">Map: </span>
                <input
                  type="text"
                  className="input input-bordered input-xs"
                  {...register('mapId', { required: true })}
                />
                <button
                  className="btn btn-xs btn-link ml-1 normal-case"
                  onClick={handleClickCurrent}>
                  current
                </button>
              </div>
              <div className="text-sm">
                <span>Timer: </span>
                <input
                  type="number"
                  className="input input-bordered input-xs max-w-[6em]"
                  {...register('timer.hour', {
                    required: false,
                    valueAsNumber: true,
                    min: 1,
                    max: 23,
                    maxLength: 2
                  })}
                />
                <span> : </span>
                <input
                  type="number"
                  className="input input-bordered input-xs max-w-[6em]"
                  {...register('timer.minute', {
                    required: false,
                    valueAsNumber: true,
                    min: 0,
                    max: 59,
                    maxLength: 2
                  })}
                />
                <div className="inline-flex items-center gap-1 ml-2">
                  {daysList.map((i) => {
                    return (
                      <button
                        key={i}
                        className={clsx(
                          'btn btn-circle btn-xs',
                          (watch('timer.days') ?? []).includes(i) &&
                            'btn-primary'
                        )}
                        onClick={() => handleSelectDay(i)}>
                        {dayjs().day(i).format('dd')}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="submit"
              value="Save"
              className="btn btn-sm btn-outline btn-primary"
              onClick={onSubmit}
            />
            <button className="btn btn-outline btn-sm" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            'w-full h-12 flex items-center p-3 rounded-md duration-75  bg-base-100 text-neutral-content',
            data.isPlaying
              ? 'border-2 border-success'
              : 'border border-neutral-content'
          )}>
          <div className="tooltip tooltip-bottom" data-tip="Teleport">
            <button
              className="btn btn-circle btn-ghost btn-sm mr-2"
              onClick={() => {
                onClick?.(data)
              }}>
              <FlagIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="font-bold text-sm">{data.name}</p>
          <div className="ml-auto flex items-center gap-1">
            {data.timer?.hour != null &&
              data.timer?.minute != null &&
              !Number.isNaN(data.timer.hour) &&
              !Number.isNaN(data.timer.minute) && (
                <div className="flex items-center gap-2">
                  {data.isPlaying ? (
                    <div
                      className="tooltip tooltip-bottom"
                      data-tip="Stop Timer">
                      <button
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => onStopTimer?.(id)}>
                        <PauseIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="tooltip tooltip-bottom"
                      data-tip="Start Timer">
                      <button
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => onStartTimer?.(id, data.timer)}>
                        <PlayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  <p className="font-bold text-sm mr-2">
                    {String(data.timer.hour).padStart(2, '0')}:
                    {String(data.timer.minute).padStart(2, '0')}
                  </p>
                </div>
              )}
            <div className="tooltip tooltip-bottom" data-tip="Edit">
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={onEdit}>
                <PencilAltIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="tooltip tooltip-bottom" data-tip="Delete">
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={onDelete}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const container = document.querySelector('#root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}
