export interface GlobalConfig {
  global_base_url: string
  global_success_code: number | string
  global_unauthorized_code: number | string
  global_unlogin_code: number | string
  global_show_success: boolean
  global_show_error: boolean
  global_error_function: (error: string) => void
  global_success_function: (error: string) => void
}

// 默认请求成功code
export const GLOBAL_SUCESS_CODE = 0
// 请求无权限code
export const GLOBAL_UNAUTHORIZED_CODE = -110
// 未登录
export const GLOBAL_UNLOGIN_CODE = -101

export const globalConfig = {
  global_success_code: GLOBAL_SUCESS_CODE,
  global_unauthorized_code: GLOBAL_UNAUTHORIZED_CODE,
  global_unlogin_code: GLOBAL_UNLOGIN_CODE,
  global_show_success: true,
  global_show_error: true,
  global_base_url: '',
  global_success_function: () => {},
  global_error_function: () => {},
}

export const modelConfigKeys = ['success', 'error']
