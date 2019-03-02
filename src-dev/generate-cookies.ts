import { Cookie as toughCookie, CookieJar } from 'tough-cookie'

import Cookies, { CookieArray } from '../src/cookies'

export enum CookiesTypes {
  Empty = 1 << 0,
  undefined = 1 << 1,
  Cookie = 1 << 2,
  CookieParsed = Cookie | undefined,
  object = 1 << 3,
  string = 1 << 4,
  CookieJar = 1 << 5,
  EmptyCookieJar = CookieJar | Empty,
  Cookies = 1 << 6,
  EmptyCookies = Cookies | Empty
}

export type GeneratedCookies = Cookies | CookieArray

class GenCookies extends Array {
  public static generate (
    param: any[] | number = 0,
    type = CookiesTypes.string,
    url = ''
  ): GeneratedCookies {
    switch (type) {
      case CookiesTypes.Empty:
        return []
      case CookiesTypes.EmptyCookieJar:
        return new CookieJar()
      case CookiesTypes.EmptyCookies:
        return new Cookies([])
      case CookiesTypes.CookieJar:
        const jar = new CookieJar()

        for (const cookie of new GenCookies(param)) {
          jar.setCookieSync(cookie, url)
        }

        return jar
      case CookiesTypes.Cookies:
        return new Cookies(new GenCookies(param))
      default:
        return new GenCookies(param, type)
    }
  }

  private constructor (param: any[] | number, type = CookiesTypes.string) {
    super(0)

    const length = param instanceof Array ? param.length : param

    for (let i = 0; i < length; ++i) {
      let key = 'name' + i
      let value = 'value' + (Math.random() * 1000).toFixed(0)

      if (param instanceof Array) {
        let elem = param[i]
        if (!elem) continue

        switch (typeof elem) {
          case 'string':
            elem = toughCookie.parse(elem)
          case 'object':
            ({ key, value } = elem)
            break
          default:
            continue
        }
      }

      switch (type) {
        case CookiesTypes.CookieParsed:
          this.push(toughCookie.parse(`${key}=${value}`))
          break
        case CookiesTypes.Cookie:
          this.push(new toughCookie({ key, value }))
          break
        case CookiesTypes.object:
          this.push({ key, value })
          break
        case CookiesTypes.string:
          this.push(`${key}=${value}`)
          break
      }
    }
  }
}

export default GenCookies.generate
