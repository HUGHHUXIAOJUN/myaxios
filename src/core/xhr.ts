declare var ActiveXObject: new (type: string) => any
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method,
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config
    const request = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject('microsoft.XMLHttp')
    request.open(method!.toUpperCase(), url, true)
    configureRequest()
    addEVents()
    processHeaders()
    processCancel()
    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }
      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }
    function addEVents(): void {
      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request)) // 网络错误
      }
      request.ontimeout = function handleTimeout() {
        reject(createError(`Timeout of ${timeout} ms  exceeded`, config, 'ECONNABORTED', request)) // 超时错误
      }
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
      request.onreadystatechange = function handleload() {
        if (request.readyState !== 4) {
          /**
           *  0：请求未初始化（还没有调用 open()）。
           *  1：请求已经建立，但是还没有发送（还没有调用 send()）。
           *  2：请求已发送，正在处理中（通常现在可以从响应中获取内容头）。
           *  3：请求在处理中；通常响应中已有部分数据可用了，但是服务器还没有完成响应的生成。
           *  4：响应已完成；您可以获取并使用服务器的响应了
           */
          return
        }
        if (request.status === 0) {
          // 网络错误 超时等
          return
        }
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        const responseData =
          responseType && responseType !== 'text' ? request.response : request.responseText
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        handleResponse(response)
      }
    }
    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type']
      }
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue && xsrfHeaderName) {
          headers[xsrfHeaderName] = xsrfValue
        }
      }
      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }
    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise
          .then(reason => {
            request.abort()
            reject(reason)
          })
          .catch()
      }
    }
    function handleResponse(response: AxiosResponse): void {
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
