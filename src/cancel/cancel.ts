export default class Cancel {
  message?: string
  constructor(message?: string) {
    if (message) {
      this.message = message
    }
  }
}
export function isCancel(value: any): boolean {
  return value instanceof Cancel
}
