import { Cookie as toughCookie, CookieJar } from 'tough-cookie'

import { CookieJar as RequestJar } from 'request'
import request from 'requestretry'

export type Cookie = toughCookie | string | object
export type CookieArray = CookieJar | Cookie[]

export default class Cookies {
  public get jar () {
    return this._jar
  }
  public set jar (value) {
    this._jar = value

    // TODO: use request lib that user uses, because of CookieJar conflicts
    this._requestJar = request.jar()
    this._requestJar._jar = value
  }
  public get requestJar () {
    return this._requestJar
  }
  private _jar: CookieJar
  private _requestJar: RequestJar

  constructor (cookies: CookieArray) {
    this.jar = cookies instanceof CookieJar ? cookies : new CookieJar()

    if (cookies instanceof Array) {
      this.import(cookies)
    }
  }

  public export () {
    return this.jar.toJSON().cookies
  }

  public clone () {
    // https://github.com/salesforce/tough-cookie/issues/147
    // const jar = this.jar.cloneSync();

    const jar = this.jar._cloneSync()
    return new Cookies(jar)
  }

  private import (
    cookies: Cookie[],
    /* istanbul ignore next */
    { url = 'https://steamcommunity.com/' } = {}
  ) {
    for (const cookie of cookies) {
      if (cookie) {
        const cookieNormalized = normalize(cookie)
        if (cookieNormalized) {
          this.jar.setCookieSync(cookieNormalized, url)
        }
      }
    }

    function normalize (cookie: Cookie) {
      return cookie instanceof toughCookie || typeof cookie === 'string'
        ? cookie
        : toughCookie.fromJSON(cookie)
    }
  }
}
