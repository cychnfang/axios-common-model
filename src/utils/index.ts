export function isObject(value: any) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isFunction(value: any) {
  return typeof value === 'function'
}

export function getUniqueBase64(obj: Record<string, any>): string {
  const jsonStr = JSON.stringify(
    Object.keys(obj || {})
      .sort()
      .reduce(
        (result, key) => {
          result[key] = obj[key]
          return result
        },
        {} as Record<string, any>,
      ),
  )
  return btoa(jsonStr)
}

export function isFormData(value: any) {
  return value instanceof FormData
}
