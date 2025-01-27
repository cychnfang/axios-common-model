import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { globalConfig, modelConfigKeys, type GlobalConfig } from './default'
import { isFunction, isObject, getUniqueBase64 } from './utils'

export type Model = AxiosInstance & GlobalConfig

type Reponse<R> = {
  code: number
  message: string
  data: R
}

type FormatParams<D> = (data?: D) => any
type FormatResponse<R = any> = (response: R) => Promise<any>

type ModelConfig = {
  success: boolean
  error: boolean
}

// 缓存请求
const abortControllerMap = new Map<string, AbortController>()

function createModel(): Model {
  const model = axios.create() as Model
  Object.entries(globalConfig).forEach(([key, value]) => {
    if (globalConfig.hasOwnProperty(key)) {
      ;(model[key as keyof GlobalConfig] as any) = value
    }
  })
  return model
}

// 处理参数
function handleParams(data: any) {
  return Object.entries(data).reduce<{
    params: Record<string, any>
    modelConfig: Record<string, any>
  }>(
    (obj, [key, value]) => {
      const curKey = modelConfigKeys.includes(key) ? 'modelConfig' : 'params'
      obj[curKey][key] = value
      return obj
    },
    {
      params: {},
      modelConfig: {},
    },
  )
}

function handleFileParams(data: any) {
  return {
    params: data?.files,
    modelConfig: {
      Headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  }
}

function handleRuestSuccess<R>(
  data: Reponse<R>,
  modelConfig: Partial<ModelConfig>,
) {
  const {
    global_success_code,
    global_unauthorized_code,
    global_unlogin_code,
    global_show_success,
    global_show_error,
  } = model

  const showSuccess =
    modelConfig?.success === undefined
      ? global_show_success
      : Boolean(modelConfig.success)
  const showError =
    modelConfig?.error === undefined
      ? global_show_error
      : Boolean(modelConfig.error)
  const { code, message } = data

  // 请求成功
  if (code === global_success_code) {
    showSuccess && model.global_success_function(message || '请求成功')
    return
  }

  // 无权限
  if (code === global_unauthorized_code && showError) {
    showError && model.global_error_function(message || '暂无权限')
    return
  }

  // 未登录
  if (code === global_unlogin_code && showError) {
    showError && model.global_error_function(message || '未登录')
    return
  }

  model.global_error_function(message)
}

// 处理错误
function handleError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    return new Error(
      error.response?.data?.message || error.message || 'Request failed',
    )
  }
  return error instanceof Error ? error : new Error('Unknown error')
}

// 创建abortController 用于取消相同请求
function createAbortController(method_url: string, data: Record<string, any>) {
  const abortId = `${method_url}_${getUniqueBase64(data)}`
  const preController = abortControllerMap.get(abortId)
  if (preController) {
    preController.abort()
  }
  const controller = new AbortController()
  abortControllerMap.set(abortId, controller)
  return {
    abortId,
    controller,
  }
}

function deleteAbortController(abortId: string) {
  abortControllerMap.delete(abortId)
}

export function post<R = any, D = any>(
  url: string,
  data?: D,
  formatParams?: FormatParams<D>,
  formatResponse?: FormatResponse<Reponse<R>>,
  config?: AxiosRequestConfig<D>,
): Promise<R> {
  const { abortId, controller } = createAbortController(
    url,
    data as Record<string, any>,
  )
  const formatedData = isFunction(formatParams)
    ? (formatParams as FormatParams<D>)(data)
    : data

  let formatedConfig = null

  if (url.includes('/upload')) {
    formatedConfig = handleFileParams(formatedData)
  } else {
    formatedConfig = isObject(formatedData)
      ? handleParams(formatedData)
      : { params: formatedData }
  }

  const { params, modelConfig } = formatedConfig
  return new Promise((resolve, reject) => {
    model
      .post<Reponse<R>>(url, params, {
        ...config,
        signal: controller.signal,
      })
      .then((response) => {
        handleRuestSuccess<R>(
          response.data,
          modelConfig as Partial<ModelConfig>,
        )

        const isSuccess = response.data.code === model.global_success_code
        if (isSuccess) {
          resolve(
            isFunction(formatResponse)
              ? (formatResponse as FormatResponse<Reponse<R>>)(response.data)
              : response.data.data,
          )
          return
        }

        reject(response.data.message)
      })
      .catch((e) => {
        reject(handleError(e))
      })
      .finally(() => {
        deleteAbortController(abortId)
      })
  })
}

export function get<R = any, D = any>(
  url: string,
  data?: D,
  formatParams?: FormatParams<D>,
  formatResponse?: FormatResponse<Reponse<R>>,
  config?: AxiosRequestConfig<D>,
): Promise<R> {
  const { abortId, controller } = createAbortController(
    `get:${url}`,
    data as Record<string, any>,
  )
  const formatedData = isFunction(formatParams)
    ? (formatParams as FormatParams<D>)(data)
    : data

  const { params, modelConfig } = isObject(formatedData)
    ? handleParams(formatedData)
    : { params: formatedData }

  return new Promise((resolve, reject) => {
    model
      .get<Reponse<R>>(url, {
        params,
        ...config,
        signal: controller.signal,
      })
      .then((response) => {
        handleRuestSuccess<R>(
          response.data,
          modelConfig as Partial<ModelConfig>,
        )

        const isSuccess = response.data.code === model.global_success_code
        if (isSuccess) {
          resolve(
            isFunction(formatResponse)
              ? (formatResponse as FormatResponse<Reponse<R>>)(response.data)
              : response.data.data,
          )
          return
        }

        reject(response.data.message)
      })
      .catch((e) => {
        reject(handleError(e))
      })
      .finally(() => {
        deleteAbortController(abortId)
      })
  })
}

const model = createModel()

export default model
