import { FC, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import {
  TrashIcon,
  PencilAltIcon,
  PlayIcon,
  PlusCircleIcon,
  FlagIcon
} from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import { ACTIONS, getTabId } from './utils'

type Data = {
  name: string
  position: {
    x: number
    y: number
  }
  mapId: string
}

export function Popup() {
  const [list, setList] = useState<{
    [key: number]: Data
  }>({
    1: {
      name: 'Meeting',
      position: {
        x: 5,
        y: 29
      },
      mapId: 'rw-12'
    }
  })
  const [tmpData, setTmpData] = useState<Data | undefined>(undefined)
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [current, setCurrent] = useState<
    Pick<Data, 'mapId' | 'position'> | undefined
  >(undefined)

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
      return { ...cloneObj }
    })
  }

  const handleSave = (id: number, data: Data) => {
    setTmpData(undefined)
    setEditingId(undefined)
    setCurrent(undefined)
    setList((prev) => {
      return { ...prev, [id === 0 ? Date.now() : id]: data }
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
      chrome.tabs.sendMessage(tabId, {
        action: ACTIONS.GET_CURRENT_POSITION,
        data: {}
      })
    }
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log({ request })
      switch (request.action) {
        case ACTIONS.GET_CURRENT_POSITION:
          setCurrent({
            position: request.data.position,
            mapId: request.data.mapId
          })
          break
      }
      return true
    })
  }, [])

  const handleAdd = async () => {
    setEditingId(undefined)
    setTmpData({
      name: '',
      mapId: '',
      position: {
        x: 0,
        y: 0
      }
    })
    await getCurrent()
  }

  return (
    <div className="px-2 py-5 w-[520px] bg-gray-500 space-y-5">
      <div className="w-full gap-3 flex flex-col">
        {Object.entries(list).map(([key, value]) => {
          const id = Number(key)
          return (
            <Item
              key={id}
              id={id}
              data={value}
              isEdit={editingId === id}
              current={current}
              onClick={onClick}
              onEdit={() => handleEdit(id)}
              onDelete={() => handleDelete(id)}
              onSave={(data) => handleSave(id, data)}
              onCancel={() => handleCancel()}
              getCurrent={getCurrent}
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
          className="btn btn-block btn-outline gap-2 text-black"
          onClick={async () => {
            await getCurrent()
            handleAdd()
          }}>
          <PlusCircleIcon className="text-black w-5 h-5" />
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
  getCurrent
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    defaultValues: data
  })

  useEffect(() => {
    setValue('mapId', current?.mapId ?? data.mapId)
    setValue('position', current?.position ?? data.position)
  }, [current])

  const onSubmit = handleSubmit((data) => {
    console.log(data)
    onSave(data)
  })
  const handleClickCurrent = async () => {
    await getCurrent()
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }
  return (
    <>
      {isEdit ? (
        <div key={id}>
          <div className="bg-gray-300 w-full flex items-center p-3 rounded-md border-gray-500 border">
            <div className="flex flex-col gap-2 w-full">
              <input
                type="text"
                placeholder="MTG"
                className="input input-ghost input-xs text-black text-sm"
                {...register('name', { required: true, maxLength: 20 })}
              />
              <div className="text-black text-sm">
                <span>X: </span>
                <input
                  type="number"
                  className="input input-ghost input-xs max-w-[5em]"
                  {...register('position.x', {
                    required: true,
                    valueAsNumber: true
                  })}
                />
                <span className="ml-3">Y: </span>
                <input
                  type="number"
                  className="input input-ghost input-xs max-w-[5em]"
                  {...register('position.y', {
                    required: true,
                    valueAsNumber: true
                  })}
                />
                <span className="ml-3">Map: </span>
                <input
                  type="text"
                  className="input input-ghost input-xs"
                  {...register('mapId', { required: true })}
                />
                <button
                  className="btn btn-xs btn-link ml-1 normal-case"
                  onClick={handleClickCurrent}>
                  current
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="submit"
              value="Save"
              className="btn btn-sm btn-outline btn-accent"
              onClick={onSubmit}
            />
            <button className="btn btn-outline btn-sm" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-300 w-full h-12 flex items-center p-3 rounded-md hover:bg-gray-200 duration-75">
          <button
            className="btn btn-circle btn-ghost btn-sm mr-2"
            onClick={() => {
              onClick?.(data)
            }}>
            <FlagIcon className="text-black w-5 h-5" />
          </button>
          <p className="font-bold text-sm text-black">{data.name}</p>
          <div className="ml-auto flex items-center gap-1">
            <div className="flex items-center">
              <button className="btn btn-circle btn-ghost btn-sm">
                <PlayIcon className="text-black w-5 h-5" />
              </button>
              <p className="font-bold text-sm text-black">13:00</p>
            </div>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onEdit}>
              <PencilAltIcon className="text-black w-5 h-5" />
            </button>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onDelete}>
              <TrashIcon className="text-black w-5 h-5" />
            </button>
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
