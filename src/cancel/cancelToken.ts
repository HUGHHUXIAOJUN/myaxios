import { CancelExecutor, CancelTokenSource, Canceler } from './../types/index'
import Cancel from './cancel'
interface ResolvePromise {
  (reason?: Cancel): void
}
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  constructor(executor: CancelExecutor) {
    let ResolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>((resolve: any) => {
      ResolvePromise = resolve
    })
    executor(message => {
      if (this.reason) return
      this.reason = new Cancel(message)
      ResolvePromise(this.reason)
    })
  }
  throwIfRequested() {
    if (this.reason) {
      throw this.reason
    }
  }
  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
