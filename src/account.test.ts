import SteamCommunity from 'steamcommunity'

import Account, { LoginResponse } from './account'
import Cookies from './cookies'
import LoginError from './login-error'

import GenCookies, { CookiesTypes } from '../src-dev/generate-cookies'
import skip from '../src-dev/skip'

let steamCookies: string[]

beforeAll(async () => {
  const community = new SteamCommunity()

  steamCookies = await new Promise((resolve, reject) =>
    community.login(
      {
        accountName: 'test_without_2fa',
        password: 'DoNotChangeThePassword',
        disableMobile: true
      },
      (error, sessionID, cookies) => (error ? reject(error) : resolve(cookies))
    )
  )
}, 30000)

const fullTest =
  String(process.env.npm_config_full || process.env.full) === 'true'

describe.each`
  full     | typename              | type                           | site                                       | domain                  | url
  ${false} | ${'Cookie'}           | ${CookiesTypes.Cookie}         | ${'https://www.csgo500.com/steam/preauth'} | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${true}  | ${'Cookie|undefined'} | ${CookiesTypes.CookieParsed}   | ${'https://www.csgo500.com/steam/preauth'} | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${true}  | ${'object'}           | ${CookiesTypes.object}         | ${'https://www.csgo500.com/steam/preauth'} | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${true}  | ${'string'}           | ${CookiesTypes.string}         | ${'https://www.csgo500.com/steam/preauth'} | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${true}  | ${'CookieJar'}        | ${CookiesTypes.CookieJar}      | ${'https://www.csgo500.com/steam/preauth'} | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${true}  | ${'Cookies'}          | ${CookiesTypes.Cookies}        | ${'https://www.csgo500.com/steam/preauth'} | ${'steamcommunity.com'} | ${'https://steamcommunity.com/'}
  ${false} | ${'Empty'}            | ${CookiesTypes.Empty}          | ${'https://www.csgo500.com/steam/preauth'} | ${null}                 | ${null}
  ${true}  | ${'Empty|CookieJar'}  | ${CookiesTypes.EmptyCookieJar} | ${'https://www.csgo500.com/steam/preauth'} | ${null}                 | ${null}
  ${true}  | ${'Empty|Cookies'}    | ${CookiesTypes.EmptyCookies}   | ${'https://www.csgo500.com/steam/preauth'} | ${null}                 | ${null}
`(
  'full: $full, type: $typename, site: $site, domain: $domain, url: $url',
  ({ type, site, domain, url, full }) => {
    const isEmpty = !!(type & CookiesTypes.Empty)
    const skipFull = !fullTest && full

    describe('init', () => {
      let account: Account
      let length: number

      beforeAll(() => {
        const genCookies = GenCookies(steamCookies, type, url)
        account = new Account(genCookies)
        length = isEmpty ? 0 : steamCookies.length
      })

      test('.cookies must be instance of Cookies', () =>
        expect(account.cookies).toBeInstanceOf(Cookies))
      test(`exported cookies must have ${length} length`, () =>
        expect(account.cookies.export()).toHaveLength(length))
      test(`exported cookies must have ${domain} domain`, () =>
        expect(account.cookies.export()).toMatchObject(
          new Array(length).fill({ domain })
        ))

      skip(isEmpty).not.test(`exported cookies must match steamCookies`, () =>
        expect(
          GenCookies(account.cookies.export(), CookiesTypes.string)
        ).toMatchObject(steamCookies)
      )
    })

    skip(skipFull).not.describe('login', () =>
      describe.each`
        param
        ${undefined}
        ${{}}
        ${{ clone: true }}
        ${{ clone: false }}
      `('param: $param', ({ param }) => {
        let response: LoginResponse
        let error: Error

        beforeAll(() => {
          if (skipFull) return

          const genCookies = GenCookies(steamCookies, type, url)
          const account = new Account(genCookies)

          return account
            .login(site, param)
            .then(resp => {
              response = resp
            })
            .catch(err => {
              error = err
              if (!isEmpty) throw error
            })
        }, 30000)

        skip(isEmpty).test('must throw LoginError', () =>
          expect(error).toBeInstanceOf(LoginError)
        )

        skip(isEmpty).not.describe('', () => {
          test('statusCode must be 200', () =>
            expect(response.statusCode).toBe(200))
          test('body must be string', () =>
            expect(typeof response.body).toBe('string'))
          test('cookies.length must be greater 0', () =>
            expect(response.cookies.length).toBeGreaterThan(0))
        })
      })
    )
  }
)
