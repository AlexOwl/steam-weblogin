// tslint:disable: object-literal-sort-keys

interface SkipObject {
  describe: jest.Describe
  fdescribe: jest.Describe
  xdescribe: jest.Describe

  it: jest.It
  fit: jest.It
  xit: jest.It

  test: jest.It
  xtest: jest.It

  not?: Skip
}
type SkipFunction = (not?: boolean) => Skip
type Skip = SkipObject & SkipFunction

const skip: Skip = Object.assign((not = false) => (not ? skip.not : skip), {
  describe: xdescribe,
  fdescribe: xdescribe,
  xdescribe: describe,

  it: xit,
  fit: xit,
  xit: it,

  test: xtest,
  xtest: test,

  not: Object.assign((not = false) => (not ? skip : skip.not), {
    describe,
    fdescribe,
    xdescribe,

    it,
    fit,
    xit,

    test,
    xtest
  })
})

skip.not.not = skip

export default skip
