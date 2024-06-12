import { cleanup, render } from "@testing-library/react"
import { vi, it, beforeEach, expect, afterEach } from "vitest"
import userEvent from "@testing-library/user-event"
import App from "./App"

const mock = {
  default: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^4.1.2
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; yarn; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; yarn; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
    },
  },

  withBumpLockfile: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^4.1.2
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"; rm package-lock.json; npm i; git add -A; git commit -m "chore(deps): bump lockfile"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; yarn; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; yarn; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"; rm yarn.lock; yarn; git add -A; git commit -m "chore(deps): bump lockfile"`,
    },
  },

  withMinor: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript            ^4.0  →     ^4.1
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4.1"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; yarn; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; yarn; git add -A; git commit -m "chore(deps): bump typescript to 4.1"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
    },
  },

  withMajor: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript              ^4  →       ^4
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; yarn; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; yarn; git add -A; git commit -m "chore(deps): bump typescript to 4"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
    },
  },

  invalid: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^4.1.2
    @types/react      ^16.8.23  →`,
    output: {
      npm: `This doesn't look like a valid npx npm-check-updates output.`,
      yarn: `This doesn't look like a valid npx npm-check-updates output.`,
    },
  },
}

const getItemSpy = vi.spyOn(localStorage, "getItem")
const setItemSpy = vi.spyOn(localStorage, "setItem")

afterEach(() => {
  getItemSpy.mockClear()
  setItemSpy.mockClear()
  localStorage.clear()
})

beforeEach(() => {
  cleanup()
})

it("shows empty inputs", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  expect(input.value).toEqual("")
  expect(output.value).toEqual("")
})

it("fills output (npm)", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.npm)
})

it("fills output (yarn)", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const yarnRadio = getByTestId("radio-yarn") as HTMLInputElement

  userEvent.click(yarnRadio)

  input.focus()
  await userEvent.paste(mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.yarn)
})

it("behaves correctly switching from yarn to npm", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const npmRadio = getByTestId("radio-npm") as HTMLInputElement
  const yarnRadio = getByTestId("radio-yarn") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.npm)

  await userEvent.click(yarnRadio)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.yarn)

  await userEvent.click(npmRadio)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.npm)
})

it("supports minor versions", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.withMinor.input)

  expect(input.value).toEqual(mock.withMinor.input)
  expect(output.value).toEqual(mock.withMinor.output.npm)
})

it("supports major versions", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.withMajor.input)

  expect(input.value).toEqual(mock.withMajor.input)
  expect(output.value).toEqual(mock.withMajor.output.npm)
})

it("shows a message on an invalid input", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.invalid.input)

  expect(input.value).toEqual(mock.invalid.input)
  expect(output.value).toEqual(mock.invalid.output.npm)
})

it("shows a list of libraries from the input", async () => {
  const { getByTestId, getAllByTestId, getByText } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  expect(getAllByTestId("library")).toHaveLength(6)
  expect(getByText("react 16.8.6 → 17.0.1")).toBeDefined()
  expect(getByText("react-dom 16.8.6 → 17.0.1")).toBeDefined()
  expect(getByText("react-scripts 3.0.1 → 4.0.1")).toBeDefined()
  expect(getByText("typescript 3.5.3 → 4.1.2")).toBeDefined()
  expect(getByText("@types/react 16.8.23 → 17.0.0")).toBeDefined()
  expect(getByText("@types/react-dom 16.8.5 → 17.0.0")).toBeDefined()
})

it("makes it possible to enable/disable libraries", async () => {
  const { getByTestId, getAllByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  const [
    reactLib,
    reactDomLib,
    reactScriptsLib,
    typescriptLib,
    typesReactLib,
    typesReactDomLib,
  ] = getAllByTestId("library")

  const getInput = (element: HTMLElement): HTMLInputElement =>
    element.querySelector("input")!

  expect(getInput(reactLib).checked).toBeTruthy()
  expect(getInput(reactDomLib).checked).toBeTruthy()
  expect(getInput(reactScriptsLib).checked).toBeTruthy()
  expect(getInput(typescriptLib).checked).toBeTruthy()
  expect(getInput(typesReactLib).checked).toBeTruthy()
  expect(getInput(typesReactDomLib).checked).toBeTruthy()

  // would prefer clicking label, but happy-dom has a bug causing it to fire twice
  // https://github.com/capricorn86/happy-dom/issues/1410
  await userEvent.click(getInput(reactDomLib))

  expect(getInput(reactLib).checked).toBeTruthy()
  expect(getInput(reactDomLib).checked).not.toBeTruthy()
  expect(getInput(reactScriptsLib).checked).toBeTruthy()
  expect(getInput(typescriptLib).checked).toBeTruthy()
  expect(getInput(typesReactLib).checked).toBeTruthy()
  expect(getInput(typesReactDomLib).checked).toBeTruthy()

  await userEvent.click(getInput(typescriptLib))

  expect(getInput(reactLib).checked).toBeTruthy()
  expect(getInput(reactDomLib).checked).not.toBeTruthy()
  expect(getInput(reactScriptsLib).checked).toBeTruthy()
  expect(getInput(typescriptLib).checked).not.toBeTruthy()
  expect(getInput(typesReactLib).checked).toBeTruthy()
  expect(getInput(typesReactDomLib).checked).toBeTruthy()

  await userEvent.click(getInput(typescriptLib))

  expect(getInput(reactLib).checked).toBeTruthy()
  expect(getInput(reactDomLib).checked).not.toBeTruthy()
  expect(getInput(reactScriptsLib).checked).toBeTruthy()
  expect(getInput(typescriptLib).checked).toBeTruthy()
  expect(getInput(typesReactLib).checked).toBeTruthy()
  expect(getInput(typesReactDomLib).checked).toBeTruthy()
})

it("makes it possible to bump lockfile", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const bumpLockfile = getByTestId("bump-lockfile") as HTMLLabelElement
  const bumpLockfileCheckbox = getByTestId(
    "bump-lockfile-checkbox"
  ) as HTMLInputElement

  bumpLockfile.click()
  input.focus()
  await userEvent.paste(mock.withBumpLockfile.input)

  expect(bumpLockfileCheckbox.checked).toBeTruthy()

  expect(input.value).toEqual(mock.withBumpLockfile.input)
  expect(output.value).toEqual(mock.withBumpLockfile.output.npm)
})

it("restores disabled libraries from localstorage", async () => {
  const ignoredLibaries = ["react", "react-dom"]

  localStorage.setItem("ignoredLibs", JSON.stringify(ignoredLibaries))

  const { getByTestId, getAllByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  const [
    reactLib,
    reactDomLib,
    reactScriptsLib,
    typescriptLib,
    typesReactLib,
    typesReactDomLib,
  ] = getAllByTestId("library")

  const getInput = (element: HTMLElement): HTMLInputElement =>
    element.querySelector("input")!

  expect(getInput(reactLib).checked).not.toBeTruthy()
  expect(getInput(reactDomLib).checked).not.toBeTruthy()
  expect(getInput(reactScriptsLib).checked).toBeTruthy()
  expect(getInput(typescriptLib).checked).toBeTruthy()
  expect(getInput(typesReactLib).checked).toBeTruthy()
  expect(getInput(typesReactDomLib).checked).toBeTruthy()
})

it("saves disabled libraries to localstorage", async () => {
  const { getByTestId, getAllByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reactLib,
    reactDomLib,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reactScriptsLib,
    typescriptLib,
  ] = getAllByTestId("library")

  const getInput = (element: HTMLElement): HTMLInputElement =>
    element.querySelector("input")!

  await userEvent.click(getInput(reactDomLib))

  expect(setItemSpy).toHaveBeenCalledTimes(1)
  expect(setItemSpy).toHaveBeenLastCalledWith(
    "ignoredLibs",
    JSON.stringify(["react-dom"])
  )

  await userEvent.click(getInput(typescriptLib))

  expect(setItemSpy).toHaveBeenCalledTimes(2)
  expect(setItemSpy).toHaveBeenLastCalledWith(
    "ignoredLibs",
    JSON.stringify(["react-dom", "typescript"])
  )
})

it("restores package manager from localstorage", async () => {
  localStorage.setItem("packageManager", JSON.stringify("yarn"))

  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const yarnRadio = getByTestId("radio-yarn") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  expect(yarnRadio.checked).toBeTruthy()

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.yarn)
})

it("restores bump lockfile from localstorage", async () => {
  localStorage.setItem("bumpLockfile", JSON.stringify(true))

  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const bumpLockfileCheckbox = getByTestId(
    "bump-lockfile-checkbox"
  ) as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.withBumpLockfile.input)

  expect(bumpLockfileCheckbox.checked).toBeTruthy()

  expect(input.value).toEqual(mock.withBumpLockfile.input)
  expect(output.value).toEqual(mock.withBumpLockfile.output.npm)
})
