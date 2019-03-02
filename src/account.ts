import { RequestAPI, RequestResponse, ResponseAsJSON } from 'request'
import request from 'requestretry'

import cheerio from 'cheerio'
import qs from 'qs'

import { Cookie as toughCookie } from 'tough-cookie'
import Cookies, { CookieArray } from './cookies'

import LoginError from './login-error'

interface FormData {
  action: string
  'openid.mode': string
  openidparams: string
  nonce: string
}

export interface LoginResponse extends ResponseAsJSON {
  cookies: toughCookie.Serialized[]
}

export default class Account {
  public request: RequestAPI<any, any, any> = request.defaults({
    gzip: true,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    },
    maxAttempts: 3,
    timeout: 20000
  })

  public cookies: Cookies

  constructor (cookies: Cookies | CookieArray) {
    this.cookies = cookies instanceof Cookies ? cookies : new Cookies(cookies)
  }

  public async login (url: string, { clone = true } = {}) {
    const cookies = clone ? this.cookies.clone() : this.cookies
    const jar = cookies.requestJar

    const [formData, formUrl] = await this.getLoginData(url, { jar })

    const jsonResponse = await this.postLoginData(formData, {
      url: formUrl,
      jar
    })

    const loginResponse: LoginResponse = {
      ...jsonResponse,
      cookies: cookies.export()
    }

    return loginResponse
  }

  // TODO: Add checking redirected url to be valid
  private async getLoginData (
    url: string,
    /* istanbul ignore next */
    { jar = this.cookies.requestJar } = {}
  ) {
    const htmlSteam: string = await this.request.get(url, {
      followAllRedirects: true,
      fullResponse: false,
      resolveWithFullResponse: false,
      jar
    })

    const $ = cheerio.load(htmlSteam)
    const openidForm = $('#openidForm')

    if (!openidForm.find('#imageLogin').is('#imageLogin')) {
      throw new LoginError()
    }

    const formResponse: [FormData, string] = [
      qs.parse(openidForm.serialize()),
      openidForm.attr('action')
    ]

    return formResponse
  }

  private async postLoginData (
    formData: FormData,
    /* istanbul ignore next */
    {
      url = 'https://steamcommunity.com/openid/login',
      jar = this.cookies.requestJar
    } = {}
  ) {
    const response: RequestResponse = await this.request.post(url, {
      formData,
      followAllRedirects: true,
      fullResponse: true,
      resolveWithFullResponse: true,
      jar
    })

    const jsonResponse = response.toJSON()

    return jsonResponse
  }
}
