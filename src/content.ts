import { ACTIONS } from './utils'

const fnc = (event: any) => {
  if (event.source != window) {
    return
  }
  if (event.data.type && event.data.type === 'FROM_INJECT') {
    switch (event.data.action) {
      case ACTIONS.TELEPORT:
        const { mapId, position } = event.data.data
        teleport(mapId, position.x, position.y)
        break
      case ACTIONS.GET_CURRENT_POSITION:
        const { x, y } = window.gameSpace.gameState[window.gameSpace.id]
        const data = {
          mapId: window.gameSpace.mapId,
          position: {
            x,
            y
          }
        }
        window.postMessage(
          { type: 'FROM_CONTENT', action: ACTIONS.GET_CURRENT_POSITION, data },
          '*'
        )
    }
  }
}

window.addEventListener('message', fnc, false)

const teleport = (mapId: string, x: number, y: number) => {
  window.game.teleport(mapId, x, y)
}

export {}
