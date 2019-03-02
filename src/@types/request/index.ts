import tough from 'tough-cookie'
declare module 'request' {
  interface CookieJar {
    _jar: tough.CookieJar
  }
}
