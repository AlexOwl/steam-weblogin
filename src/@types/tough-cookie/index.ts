import 'tough-cookie'

declare module 'tough-cookie' {
  interface CookieJar {
    store: Store
    _cloneSync (store?: Store): CookieJar
  }

  interface MemoryCookieStore {
    idx: any
  }
}
