export default class LoginError extends Error {
  constructor () {
    super('Must be logged in')
  }
}
