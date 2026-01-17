import { cleanup, render } from "@testing-library/react"
import { vi, it, expect, afterEach } from "vitest"
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

  deep: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^4.1.2
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u react --deep; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom --deep; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts --deep; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript --deep; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"; npx npm-check-updates -u @types/react --deep; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom --deep; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
      yarn: `npx npm-check-updates -u react --deep; yarn; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; yarn; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript --deep; yarn; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"; npx npm-check-updates -u @types/react --deep; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
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

  byName: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript              ^4  →       ^4
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; yarn; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 17.0.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 17.0.0"`,
    },
  },

  limitMinor: {
    input: ` react              ^18.0.0  →  ^18.2.0
    react-dom          ^18.0.0  →  ^18.2.0
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^4.1.2
    @types/react      ^18.0.0  →  ^18.2.0
    @types/react-dom   ^18.0.0  →  ^18.2.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 18.2.0"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 18.2.0"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 18.2.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 18.2.0"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 18.2.0"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 18.2.0"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 18.2.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 18.2.0"`,
    },
  },

  limitPatch: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^3.5.5
    @types/react      ^16.8.23  →  ^17.0.0
    @types/react-dom   ^16.8.5  →  ^17.0.0`,
    output: {
      npm: `npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 3.5.5"`,
      yarn: `npx npm-check-updates -u typescript; yarn; git add -A; git commit -m "chore(deps): bump typescript to 3.5.5"`,
    },
  },

  unique: {
    input: ` react              ^18.0.0  →  ^18.2.0
    react-dom          ^18.0.0  →  ^18.2.0
    @types/react      ^18.0.0  →  ^18.2.0
    @types/react-dom   ^18.0.0  →  ^18.2.0
    react              ^18.0.0  →  ^18.2.0
    react-dom          ^18.0.0  →  ^18.2.0`,
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 18.2.0"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 18.2.0"; npx npm-check-updates -u @types/react; npm i; git add -A; git commit -m "chore(deps): bump @types/react to 18.2.0"; npx npm-check-updates -u @types/react-dom; npm i; git add -A; git commit -m "chore(deps): bump @types/react-dom to 18.2.0"`,
      yarn: `npx npm-check-updates -u react; yarn; git add -A; git commit -m "chore(deps): bump react to 18.2.0"; npx npm-check-updates -u react-dom; yarn; git add -A; git commit -m "chore(deps): bump react-dom to 18.2.0"; npx npm-check-updates -u @types/react; yarn; git add -A; git commit -m "chore(deps): bump @types/react to 18.2.0"; npx npm-check-updates -u @types/react-dom; yarn; git add -A; git commit -m "chore(deps): bump @types/react-dom to 18.2.0"`,
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

  npmAlias: {
    input: `vite   npm:rolldown-vite@7.2.5  →  7.3.1`,
    output: {
      npm: `npx npm-check-updates -u vite; npm i; git add -A; git commit -m "chore(deps): bump vite to 7.3.1"`,
      yarn: `npx npm-check-updates -u vite; yarn; git add -A; git commit -m "chore(deps): bump vite to 7.3.1"`,
    },
  },
}

const getItemSpy = vi.spyOn(localStorage, "getItem")
const setItemSpy = vi.spyOn(localStorage, "setItem")

afterEach(() => {
  getItemSpy.mockClear()
  setItemSpy.mockClear()
  localStorage.clear()
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

it("filters by name", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  const filterByNameInput = getByTestId("filter-by-name") as HTMLInputElement

  await userEvent.type(filterByNameInput, "react")

  input.focus()
  await userEvent.paste(mock.byName.input)

  expect(input.value).toEqual(mock.byName.input)
  expect(output.value).toEqual(mock.byName.output.npm)
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

it("limits packages to minor", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const minorRadio = getByTestId("radio-minor") as HTMLInputElement

  minorRadio.click()

  input.focus()
  await userEvent.paste(mock.limitMinor.input)

  expect(minorRadio.checked).toBeTruthy()

  expect(input.value).toEqual(mock.limitMinor.input)
  expect(output.value).toEqual(mock.limitMinor.output.npm)
})

it("limits packages to patch", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const patchRadio = getByTestId("radio-patch") as HTMLInputElement

  patchRadio.click()

  input.focus()
  await userEvent.paste(mock.limitPatch.input)

  expect(patchRadio.checked).toBeTruthy()

  expect(input.value).toEqual(mock.limitPatch.input)
  expect(output.value).toEqual(mock.limitPatch.output.npm)
})

it("filters unique packages", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.unique.input)

  expect(input.value).toEqual(mock.unique.input)
  expect(output.value).toEqual(mock.unique.output.npm)
})

it("renders only unique libraries in the UI", async () => {
  const { getByTestId, getAllByTestId, getByText } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.unique.input)

  expect(getByText("react 18.0.0 → 18.2.0")).toBeDefined()
  expect(getByText("react-dom 18.0.0 → 18.2.0")).toBeDefined()
  expect(getByText("@types/react 18.0.0 → 18.2.0")).toBeDefined()
  expect(getByText("@types/react-dom 18.0.0 → 18.2.0")).toBeDefined()

  // only 4!
  expect(getAllByTestId("library")).toHaveLength(4)
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

it("makes it possible to deep/recursive upgrade", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const deep = getByTestId("deep") as HTMLLabelElement
  const deepCheckbox = getByTestId("deep-checkbox") as HTMLInputElement

  deep.click()
  input.focus()
  await userEvent.paste(mock.deep.input)

  expect(deepCheckbox.checked).toBeTruthy()

  expect(input.value).toEqual(mock.deep.input)
  expect(output.value).toEqual(mock.deep.output.npm)
})

it("restores disabled libraries from localstorage", async () => {
  const ignoredLibaries = ["react", "react-dom"]

  localStorage.setItem("ignoredLibs", JSON.stringify(ignoredLibaries))

  const { getByTestId, getAllByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.default.input)

  expect(getAllByTestId("library")).toHaveLength(6)

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

it("restores upgrade version from localstorage", async () => {
  localStorage.setItem("upgradeVersion", JSON.stringify("minor"))

  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const minorRadio = getByTestId("radio-minor") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.limitMinor.input)

  expect(minorRadio.checked).toBeTruthy()

  expect(input.value).toEqual(mock.limitMinor.input)
  expect(output.value).toEqual(mock.limitMinor.output.npm)
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

it("restores bump lockfile from localstorage", async () => {
  localStorage.setItem("bumpLockfile", JSON.stringify(true))

  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const yarnRadio = getByTestId("radio-yarn") as HTMLInputElement
  const bumpLockfileCheckbox = getByTestId(
    "bump-lockfile-checkbox"
  ) as HTMLInputElement

  userEvent.click(yarnRadio)

  input.focus()
  await userEvent.paste(mock.withBumpLockfile.input)

  expect(bumpLockfileCheckbox.checked).toBeTruthy()

  expect(input.value).toEqual(mock.withBumpLockfile.input)
  expect(output.value).toEqual(mock.withBumpLockfile.output.yarn)
})

it("supports npm alias format (npm:package@version)", async () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  input.focus()
  await userEvent.paste(mock.npmAlias.input)

  expect(input.value).toEqual(mock.npmAlias.input)
  expect(output.value).toEqual(mock.npmAlias.output.npm)
})
