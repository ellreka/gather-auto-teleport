declare var gameSpace: {
  id: number
  mapId: string
  gameState: Array<{
    x: number
    y: number
  }>
}

declare var game: {
  teleport: (mapId: string, x: number, y: number) => void
}
