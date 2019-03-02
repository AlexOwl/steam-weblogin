import './@types/request'
import './@types/tough-cookie'

import { CookieJar, MemoryCookieStore } from 'tough-cookie'
import Cookies from './cookies'

import GenCookies, {
  CookiesTypes,
  GeneratedCookies
} from '../src-dev/generate-cookies'
import skip from '../src-dev/skip'

describe.each`
  typename              | type                           | length | domain                  | url
  ${'Cookie'}           | ${CookiesTypes.Cookie}         | ${10}  | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${'Cookie|undefined'} | ${CookiesTypes.CookieParsed}   | ${10}  | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${'object'}           | ${CookiesTypes.object}         | ${10}  | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${'string'}           | ${CookiesTypes.string}         | ${10}  | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${'CookieJar'}        | ${CookiesTypes.CookieJar}      | ${10}  | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${'CookieJar'}        | ${CookiesTypes.CookieJar}      | ${10}  | ${'example.com'}        | ${'https://example.com/'}
  ${'Empty'}            | ${CookiesTypes.Empty}          | ${0}   | ${null}                 | ${null}
  ${'Empty|CookieJar'}  | ${CookiesTypes.EmptyCookieJar} | ${0}   | ${null}                 | ${null}
`(
  'type: $typename, length: $length, domain: $domain, url: $url',
  ({ type, length, domain, url }) => {
    const isJar = !!(type & CookiesTypes.CookieJar)
    const isEmpty = !!(type & CookiesTypes.Empty)

    describe('init', () => {
      let genCookies: GeneratedCookies
      let cookies: Cookies

      beforeAll(() => {
        genCookies = GenCookies(length, type, url)
        if (genCookies instanceof Cookies) return

        cookies = new Cookies(genCookies)
      })

      skip(isJar).test('.jar must be custom jar', () =>
        expect(cookies.jar).toBe(genCookies)
      )

      test('.jar must be instance of CookieJar', () =>
        expect(cookies.jar).toBeInstanceOf(CookieJar))
      test('.requestJar._jar must be .jar', () =>
        expect(cookies.requestJar._jar).toBe(cookies.jar))
      test(`exported cookies must have ${length} length`, () =>
        expect(cookies.export()).toHaveLength(length))

      skip(isEmpty).not.test(
        `exported cookies must have ${domain} domain`,
        () =>
          expect(cookies.export()).toMatchObject(
            new Array(length).fill({ domain })
          )
      )
    })

    describe('clone', () => {
      let cookies: Cookies
      let cookiesClone: Cookies

      beforeAll(() => {
        const genCookies = GenCookies(length, type, url)
        if (genCookies instanceof Cookies) return

        cookies = new Cookies(genCookies)
        cookiesClone = cookies.clone()
      })

      test('.jar objects must be different', () =>
        expect(cookies.jar).not.toBe(cookiesClone.jar))

      test('.jar.store objects must be different', () =>
        expect(cookies.jar.store).not.toBe(cookiesClone.jar.store))
      test('.jar.store objects must match', () =>
        expect(cookies.jar.store).toMatchObject(cookiesClone.jar.store))

      test('.jar.store.idx objects must be different', () =>
        expect((cookies.jar.store as MemoryCookieStore).idx).not.toBe(
          (cookiesClone.jar.store as MemoryCookieStore).idx
        ))
      test('.jar.store.idx objects must match', () =>
        expect((cookies.jar.store as MemoryCookieStore).idx).toMatchObject(
          (cookiesClone.jar.store as MemoryCookieStore).idx
        ))

      test('exported objects must match', () =>
        expect(cookies.export()).toMatchObject(cookiesClone.export()))
    })
  }
)
