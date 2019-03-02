# Steam WebLogin

# 💿 Installation

```bat
npm i steam-weblogin
```

# 📖 Usage

```js
import Account from "steam-weblogin";
import SteamCommunity from "steamcommunity";

const community = new SteamCommunity();
community.login(
  {
    accountName: "login",
    password: "password",
    disableMobile: true
  },
  async (error, sessionID, cookies) => {
    if (!error) {
      const account = new Account(cookies);
      const {
        body,
        headers,
        request: { uri },
        cookies
      } = await account.login("https://www.csgo500.com/steam/preauth");
      console.log(uri, body, cookies, headers);
    }
  }
);
```

# 👥 Account

## Properties

### request

```js
request: RequestAPI<any, any, any>
```

- [requestretry (default)](https://npmjs.com/package/requestretry) or [request-promise](https://npmjs.com/package/request-promise) instance

```js
/* Example usage */
const response = await account.request.get("https://steamcommunity.com");

account.request = require("request-promise").defaults({
  proxy: "http://localhost:8888"
});

// the best way to change the defaults
account.request = account.request.defaults({
  proxy: "http://localhost:8888"
});
```

### cookies

```js
cookies: Cookies;
```

- [Cookies](#-cookies) instance

```js
/* Example usage */
account.cookies.export();

account.cookies = new Cookies(jar);
```

## Methods

### constructor

```js
new Account(cookies: Cookies | CookieArray)
```

- `cookies` - logged in Steam cookies (sessionid, steamLoginSecure, ...), can be [Cookies](#-cookies) or [CookieArray](#cookiearray)

```js
/* Example usage */
import Account from "steam-weblogin";
const Account = require("steam-weblogin").default; // ES5 syntax

const account = new Account([
  "steamLoginSecure=value",
  "sessionid=value",
  "steamCountry=value"
]);

const account = new Account(cookies);
```

### login

```js
login(url: String, { clone: Boolean = true }): LoginResponse
```

- `url` - any url that redirects to steam openid login page [https://steamcommunity.com/openid/login?openid.mode=checkid_setup&openid.ns=...](), like [https://www.csgo500.com/steam/preauth (3d-party site)](https://www.csgo500.com/steam/preauth)
- `clone` - if `true (default)` would use `account.jar.clone()`, else would use `account.jar` as a jar

```js
/* Example usage */
const response = await account.login("https://www.csgo500.com/steam/preauth");
```

rejects with [LoginError](#-loginerror) if passed cookies are bad

## LoginResponse

```ts
interface LoginResponse {
  statusCode: Number;
  body: String;
  headers: Object;
  request: {
    uri: Url;
    method: String;
    headers: Object;
  };
  cookies: Object;
}
```

```js
import { LoginResponse } from "steam-weblogin";
```

# 🍪 Cookies

## Properties

### jar

```js
jar: CookieJar;
```

- [CookieJar](https://www.npmjs.com/package/tough-cookie#cookiejar) instance

```js
/* Example usage */
const str = cookies.jar.getCookieStringSync("https://steamcommunity.com");

cookies.jar = new CookieJar();
```

### requestJar

```ts
readonly jar: request.CookieJar;
```

- [RequestJar](https://www.npmjs.com/package/request#requestjar) instance, changes when [jar](#jar) changes

```js
/* Example usage */
request.get("https://steamcommunity.com", { jar: cookies.requestJar });
```

## Methods

### constructor

```js
new Cookies(cookies: CookieArray);
```

- `cookies` - logged in Steam cookies (sessionid, steamLoginSecure, ...), can be [Cookies](#-cookies) or [CookieArray](#cookiearray)

```js
import { Cookies } from "steam-weblogin";

const cookies = new Cookies([
  "steamLoginSecure=value",
  "sessionid=value",
  "steamCountry=value"
]);

const cookies = new Cookies(jar);
```

### export

```js
export(): {key: String, value: String, domain: String, ...}[]
```

- returns [Cookie.Serialized[]](https://www.npmjs.com/package/tough-cookie#serialization-format) ([code](https://github.com/salesforce/tough-cookie/blob/43507052a70751501d52aad38bd837bb2edfedd8/lib/cookie.js#L718))

### clone

```js
clone(): Cookies
```

- returns [Cookies'](#-cookies) deep clone

## CookieArray

```ts
type CookieArray = CookieJar | (Cookie | String | Object)[];
```

```js
import { CookieArray } from "steam-weblogin";
```

# ❌ LoginError

## Properties

### message

```js
message: String = "Must be logged in";
```

## Methods

### constructor

```js
new LoginError();
```

```js
/* Example usage */
import { LoginError } from "steam-weblogin";

if (error instanceof LoginError) {
  // do something
}
```

# 📝 License

Released under [MIT license](https://AlexOwl.mit-license.org/)
