import { ResolvedFn, RejcetFn } from './../types/index'
interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejcetFn
}
export default class InterceptorManger<T> {
  private interceptors!: Array<Interceptor<T> | null>
  constructor() {
    this.interceptors = []
  }
  use(resolved: ResolvedFn<T>, rejected?: RejcetFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1
  }
  forEach(fn: (interceptors: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
