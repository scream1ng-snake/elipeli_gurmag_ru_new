
export function setItem(key: string, body: Object | Array<any>) {
  localStorage.setItem(key, JSON.stringify(body));
}

export function getItem<T>(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
}
export function getArray<T>(key: string) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]') as T
    return value 
  } catch (error) {
    return []
  }
}
