export type Data = {
  name: string
  position: {
    x: number
    y: number
  }
  mapId: string
  timer?: {
    hour?: number
    minute?: number
    days: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>
  }
  isPlaying: boolean
}
