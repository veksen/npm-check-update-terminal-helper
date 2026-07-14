import { cleanup, render, within } from "@testing-library/react"
import { vi, it, expect, afterEach } from "vitest"
import userEvent from "@testing-library/user-event"
import App from "./App"

// The one-liner output chains commands with the selected joiner (default &&).
// Legacy expectations were written with "; " — chain() converts them.
const chain = (legacy: string) => legacy.split("; ").join(" && ")

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
    },
  },

  invalid: {
    input: ` react              ^16.8.6  →  ^17.0.1
    react-dom          ^16.8.6  →  ^17.0.1
    react-scripts        3.0.1  →    4.0.1
    typescript          ^3.5.3  →   ^4.1.2
    @types/react      ^16.8.23  →`,
    // The malformed line is reported, the valid lines still produce commands.
    output: {
      npm: `npx npm-check-updates -u react; npm i; git add -A; git commit -m "chore(deps): bump react to 17.0.1"; npx npm-check-updates -u react-dom; npm i; git add -A; git commit -m "chore(deps): bump react-dom to 17.0.1"; npx npm-check-updates -u react-scripts; npm i; git add -A; git commit -m "chore(deps): bump react-scripts to 4.0.1"; npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"`,
    },
  },

  npmAlias: {
    input: `vite   npm:rolldown-vite@7.2.5  →  7.3.1`,
    output: {
      npm: `npx npm-check-updates -u vite; npm i; git add -A; git commit -m "chore(deps): bump vite to 7.3.1"`,
    },
  },

  monorepoWithNotFound: {
    input: ` react    ^18.0.0  →  ^18.2.0

 @query-doctor/pglite  Not found`,
  },

  prerelease: {
    input: ` @typescript/native-preview  7.0.0-dev.20260510.1  →  7.0.0-dev.20260511.1
 vitest                                    ^4.1.5  →                ^4.1.6`,
    output: {
      npm: `npx npm-check-updates -u @typescript/native-preview; npm i; git add -A; git commit -m "chore(deps): bump @typescript/native-preview to 7.0.0-dev.20260511.1"; npx npm-check-updates -u vitest; npm i; git add -A; git commit -m "chore(deps): bump vitest to 4.1.6"`,
    },
  },
}

const setItemSpy = vi.spyOn(localStorage, "setItem")

afterEach(() => {
  setItemSpy.mockClear()
  localStorage.clear()
  cleanup()
})

type Renderer = ReturnType<typeof render>

function getOutput(r: Renderer): string {
  return r.getByTestId("output").textContent ?? ""
}

function getCard(r: Renderer, name: string): HTMLElement {
  const card = r
    .getAllByTestId("library")
    .find((el) => el.getAttribute("data-lib") === name)
  if (!card) throw new Error(`no card for ${name}`)
  return card
}

const isIncluded = (card: HTMLElement) =>
  card.getAttribute("aria-pressed") === "true"

const isSelected = (el: HTMLElement) =>
  el.getAttribute("aria-selected") === "true"

async function paste(r: Renderer, text: string) {
  const input = r.getByTestId("input") as HTMLTextAreaElement
  input.focus()
  await userEvent.paste(text)
  return input
}

it("shows an empty input and no output initially", () => {
  const r = render(<App />)

  const input = r.getByTestId("input") as HTMLTextAreaElement
  expect(input.value).toEqual("")
  expect(r.queryByTestId("output")).toBeNull()
  expect(r.queryAllByTestId("output-block")).toHaveLength(0)
})

it("fills output (npm)", async () => {
  const r = render(<App />)

  const input = await paste(r, mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(getOutput(r)).toEqual(chain(mock.default.output.npm))
})

it("fills output (yarn)", async () => {
  const r = render(<App />)

  await userEvent.click(r.getByTestId("radio-yarn"))
  const input = await paste(r, mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(getOutput(r)).toEqual(chain(mock.default.output.yarn))
})

it("behaves correctly switching from yarn to npm", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)
  expect(getOutput(r)).toEqual(chain(mock.default.output.npm))

  await userEvent.click(r.getByTestId("radio-yarn"))
  expect(getOutput(r)).toEqual(chain(mock.default.output.yarn))

  await userEvent.click(r.getByTestId("radio-npm"))
  expect(getOutput(r)).toEqual(chain(mock.default.output.npm))
})

it("supports minor versions", async () => {
  const r = render(<App />)

  await paste(r, mock.withMinor.input)

  expect(getOutput(r)).toEqual(chain(mock.withMinor.output.npm))
})

it("supports major versions", async () => {
  const r = render(<App />)

  await paste(r, mock.withMajor.input)

  expect(getOutput(r)).toEqual(chain(mock.withMajor.output.npm))
})

it("filters by name", async () => {
  const r = render(<App />)

  await userEvent.type(r.getByTestId("filter-by-name"), "react")
  await paste(r, mock.byName.input)

  expect(getOutput(r)).toEqual(chain(mock.byName.output.npm))
})

it("reports unparseable lines but keeps the valid ones", async () => {
  const r = render(<App />)

  await paste(r, mock.invalid.input)

  const errors = r.getByTestId("parse-errors")
  expect(errors.textContent).toContain("Couldn't parse 1 line")
  expect(getOutput(r)).toEqual(chain(mock.invalid.output.npm))
})

it("shows a list of libraries from the input", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)

  const names = r
    .getAllByTestId("library")
    .map((el) => el.getAttribute("data-lib"))
  expect(names).toHaveLength(6)
  expect(names).toEqual(
    expect.arrayContaining([
      "react",
      "react-dom",
      "react-scripts",
      "typescript",
      "@types/react",
      "@types/react-dom",
    ])
  )

  const reactCard = getCard(r, "react")
  expect(reactCard.textContent).toContain("16.8.6")
  expect(reactCard.textContent).toContain("17.0.1")
})

it("makes it possible to include/skip libraries", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)

  expect(isIncluded(getCard(r, "react"))).toBeTruthy()
  expect(isIncluded(getCard(r, "react-dom"))).toBeTruthy()
  expect(isIncluded(getCard(r, "typescript"))).toBeTruthy()

  await userEvent.click(getCard(r, "react-dom"))

  expect(isIncluded(getCard(r, "react"))).toBeTruthy()
  expect(isIncluded(getCard(r, "react-dom"))).not.toBeTruthy()

  await userEvent.click(getCard(r, "typescript"))
  expect(isIncluded(getCard(r, "typescript"))).not.toBeTruthy()

  await userEvent.click(getCard(r, "typescript"))
  expect(isIncluded(getCard(r, "typescript"))).toBeTruthy()
})

it("limits packages to minor", async () => {
  const r = render(<App />)

  const minorRadio = r.getByTestId("radio-minor")
  await userEvent.click(minorRadio)
  await paste(r, mock.limitMinor.input)

  expect(isSelected(minorRadio)).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.limitMinor.output.npm))
})

it("limits packages to patch", async () => {
  const r = render(<App />)

  const patchRadio = r.getByTestId("radio-patch")
  await userEvent.click(patchRadio)
  await paste(r, mock.limitPatch.input)

  expect(isSelected(patchRadio)).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.limitPatch.output.npm))
})

it("filters unique packages", async () => {
  const r = render(<App />)

  await paste(r, mock.unique.input)

  expect(getOutput(r)).toEqual(chain(mock.unique.output.npm))
})

it("renders only unique libraries in the UI", async () => {
  const r = render(<App />)

  await paste(r, mock.unique.input)

  expect(r.getAllByTestId("library")).toHaveLength(4)
})

it("makes it possible to bump lockfile", async () => {
  const r = render(<App />)

  const bumpLockfileCheckbox = r.getByTestId(
    "bump-lockfile"
  ) as HTMLInputElement
  await userEvent.click(bumpLockfileCheckbox)
  await paste(r, mock.withBumpLockfile.input)

  expect(bumpLockfileCheckbox.checked).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.withBumpLockfile.output.npm))
})

it("makes it possible to deep/recursive upgrade", async () => {
  const r = render(<App />)

  const deepCheckbox = r.getByTestId("deep") as HTMLInputElement
  await userEvent.click(deepCheckbox)
  await paste(r, mock.deep.input)

  expect(deepCheckbox.checked).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.deep.output.npm))
})

it("restores skipped libraries from the legacy ignoredLibs key", async () => {
  localStorage.setItem("ignoredLibs", JSON.stringify(["react", "react-dom"]))

  const r = render(<App />)

  await paste(r, mock.default.input)

  expect(r.getAllByTestId("library")).toHaveLength(6)
  expect(isIncluded(getCard(r, "react"))).not.toBeTruthy()
  expect(isIncluded(getCard(r, "react-dom"))).not.toBeTruthy()
  expect(isIncluded(getCard(r, "react-scripts"))).toBeTruthy()
  expect(isIncluded(getCard(r, "typescript"))).toBeTruthy()
})

it("saves skipped libraries to localstorage (both keys)", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)

  await userEvent.click(getCard(r, "react-dom"))

  const writesFor = (key: string) =>
    setItemSpy.mock.calls.filter(([k]) => k === key).map(([, v]) => v)

  expect(writesFor("skippedLibs").at(-1)).toEqual(JSON.stringify(["react-dom"]))
  expect(writesFor("ignoredLibs").at(-1)).toEqual(JSON.stringify(["react-dom"]))

  await userEvent.click(getCard(r, "typescript"))

  expect(writesFor("ignoredLibs").at(-1)).toEqual(
    JSON.stringify(["react-dom", "typescript"])
  )
})

it("restores upgrade version from localstorage", async () => {
  localStorage.setItem("upgradeVersion", JSON.stringify("minor"))

  const r = render(<App />)

  await paste(r, mock.limitMinor.input)

  expect(isSelected(r.getByTestId("radio-minor"))).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.limitMinor.output.npm))
})

it("restores package manager from localstorage", async () => {
  localStorage.setItem("packageManager", JSON.stringify("yarn"))

  const r = render(<App />)

  await paste(r, mock.default.input)

  expect(isSelected(r.getByTestId("radio-yarn"))).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.default.output.yarn))
})

it("restores bump lockfile from localstorage", async () => {
  localStorage.setItem("bumpLockfile", JSON.stringify(true))

  const r = render(<App />)

  await paste(r, mock.withBumpLockfile.input)

  const bumpLockfileCheckbox = r.getByTestId(
    "bump-lockfile"
  ) as HTMLInputElement
  expect(bumpLockfileCheckbox.checked).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.withBumpLockfile.output.npm))
})

it("bumps the right lockfile for yarn", async () => {
  localStorage.setItem("bumpLockfile", JSON.stringify(true))

  const r = render(<App />)

  await userEvent.click(r.getByTestId("radio-yarn"))
  await paste(r, mock.withBumpLockfile.input)

  const bumpLockfileCheckbox = r.getByTestId(
    "bump-lockfile"
  ) as HTMLInputElement
  expect(bumpLockfileCheckbox.checked).toBeTruthy()
  expect(getOutput(r)).toEqual(chain(mock.withBumpLockfile.output.yarn))
})

it("supports npm alias format (npm:package@version)", async () => {
  const r = render(<App />)

  await paste(r, mock.npmAlias.input)

  expect(getOutput(r)).toEqual(chain(mock.npmAlias.output.npm))
})

it("handles prerelease versions (e.g. 7.0.0-dev.20260510.1)", async () => {
  const r = render(<App />)

  await paste(r, mock.prerelease.input)

  expect(getOutput(r)).toEqual(chain(mock.prerelease.output.npm))
})

it("handles monorepo output with 'Not found' packages", async () => {
  const r = render(<App />)

  await paste(r, mock.monorepoWithNotFound.input)

  expect(r.queryByTestId("parse-errors")).toBeNull()
  expect(getOutput(r)).toContain("npx npm-check-updates -u react")
})

it("chains with ; when selected, matching the legacy output", async () => {
  const r = render(<App />)

  await userEvent.click(r.getByTestId("joiner-semi"))
  await paste(r, mock.default.input)

  expect(getOutput(r)).toEqual(mock.default.output.npm)
})

it("groups related packages into families with bulk actions", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)

  // react, react-dom, react-scripts, @types/react, @types/react-dom → "react"
  // family; typescript is standalone and stays headerless in "Other".
  const family = r
    .getByTitle("Collapse react")
    .closest(".family") as HTMLElement
  expect(family.getAttribute("data-family")).toEqual("react")
  expect(within(family).getAllByTestId("library")).toHaveLength(5)

  await userEvent.click(within(family).getByTitle("Skip all in react"))

  expect(getOutput(r)).toEqual(
    chain(
      `npx npm-check-updates -u typescript; npm i; git add -A; git commit -m "chore(deps): bump typescript to 4.1.2"`
    )
  )
})

it("supports one commit per family", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)
  await userEvent.click(r.getByText("one per family"))

  const blocks = r.getAllByTestId("output-block")
  expect(blocks).toHaveLength(2)
  expect(blocks[0].getAttribute("data-name")).toEqual("__family:react")
  expect(blocks[0].textContent).toContain(
    "npx npm-check-updates -u react react-dom react-scripts @types/react @types/react-dom"
  )
  expect(blocks[0].textContent).toContain(
    'git commit -m "chore(deps): bump react family (5 packages)"'
  )
  expect(blocks[1].getAttribute("data-name")).toEqual("typescript")
})

it("supports one commit for everything", async () => {
  const r = render(<App />)

  await paste(r, mock.default.input)
  await userEvent.click(r.getByText("one for all"))

  const blocks = r.getAllByTestId("output-block")
  expect(blocks).toHaveLength(1)
  expect(blocks[0].getAttribute("data-name")).toEqual("__bundle")
  expect(blocks[0].textContent).toContain(
    'git commit -m "chore(deps): bump 6 packages"'
  )
})
