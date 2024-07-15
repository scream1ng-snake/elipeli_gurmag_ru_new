
export function setItem(key: string, body: Object | Array<any>) {
  localStorage.setItem(key, JSON.stringify(body));
}

export function getItem<T>(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? '{}') as T;
}
