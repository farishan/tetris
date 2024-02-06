type WindowProxy = {
  eventListenerMap: {
    [key: string]: {
      [id: string]: (payload: any) => any
    }
  },
  addEventListener: (eventName: string, id: string, listener: (payload?: any) => any) => void,
  removeEventListener: (eventName: string, id: string) => void
}

const windowProxy: WindowProxy = {
  eventListenerMap: {
    mousedown: {},
    mousemove: {},
    mouseup: {},
  },
  addEventListener: function (eventName, id, listener) {
    console.log('added')
    if (!this.eventListenerMap[eventName as keyof typeof this.eventListenerMap]) this.eventListenerMap[eventName] = {}

    this.eventListenerMap[eventName][id] = listener
    window.addEventListener(eventName, listener)
  },
  removeEventListener: function (event, id) {
    window.removeEventListener(event, this.eventListenerMap[event][id])
    delete this.eventListenerMap[event][id]
  }
}

export type { WindowProxy }
export { windowProxy }