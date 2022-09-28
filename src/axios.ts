import defaults from './defaults'
import { AxiosInstance, AxiosRequestConfig, AxiosStatic } from './types/index'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/cancelToken'
import Cancel, { isCancel } from './cancel/cancel'
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const content = new Axios(config)
  const instance = Axios.prototype.request.bind(content)
  extend(instance, content)
  return instance as AxiosStatic
}
const axios = createInstance(defaults)
axios.create = function create(config = {}) {
  return createInstance(mergeConfig(defaults, config))
}
axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel
axios.all = function all(promises) {
  return Promise.all(promises)
}
axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}
axios.Axios = Axios
export default axios
