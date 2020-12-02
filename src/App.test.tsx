import React from "react"
import { render } from "@testing-library/react"
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

it("shows empty inputs", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  expect(input.value).toEqual("")
  expect(output.value).toEqual("")
})

it("fills output (npm)", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  userEvent.paste(input, mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.npm)
})

it("fills output (yarn)", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const yarnRadio = getByTestId("radio-yarn") as HTMLInputElement

  userEvent.click(yarnRadio)

  userEvent.paste(input, mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.yarn)
})

it("behaves correctly switching from yarn to npm", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement
  const npmRadio = getByTestId("radio-npm") as HTMLInputElement
  const yarnRadio = getByTestId("radio-yarn") as HTMLInputElement

  userEvent.paste(input, mock.default.input)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.npm)

  userEvent.click(yarnRadio)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.yarn)

  userEvent.click(npmRadio)

  expect(input.value).toEqual(mock.default.input)
  expect(output.value).toEqual(mock.default.output.npm)
})

it("supports minor versions", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  userEvent.paste(input, mock.withMinor.input)

  expect(input.value).toEqual(mock.withMinor.input)
  expect(output.value).toEqual(mock.withMinor.output.npm)
})

it("supports major versions", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  userEvent.paste(input, mock.withMajor.input)

  expect(input.value).toEqual(mock.withMajor.input)
  expect(output.value).toEqual(mock.withMajor.output.npm)
})

it("shows a message on an invalid input", () => {
  const { getByTestId } = render(<App />)

  const input = getByTestId("input") as HTMLInputElement
  const output = getByTestId("output") as HTMLInputElement

  userEvent.paste(input, mock.invalid.input)

  expect(input.value).toEqual(mock.invalid.input)
  expect(output.value).toEqual(mock.invalid.output.npm)
})
