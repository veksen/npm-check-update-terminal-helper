import React, { ChangeEvent, useState, useEffect, useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"
import "./App.css"
import { ReactComponent as GitHub } from "./github.svg"
interface Library {
  name: string
  from: string
  to: string
}

type PackageManager = "yarn" | "npm"

const sampleInput = `babel-plugin-styled-components  ^1.10.2  →  ^1.10.6
gatsby                          ^2.10.5  →  ^2.13.3
gatsby-image                     ^2.2.3  →   ^2.2.4
gatsby-plugin-manifest           ^2.2.0  →   ^2.2.1
gatsby-plugin-offline            ^2.2.0  →   ^2.2.1
gatsby-plugin-sharp              ^2.2.1  →   ^2.2.2
gatsby-source-filesystem         ^2.1.1  →   ^2.1.2
gatsby-transformer-sharp         ^2.2.0  →   ^2.2.1`

function App() {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [packageManager, setPackageManager] = useLocalStorage<PackageManager>(
    "packageManager",
    "npm"
  )
  const [ignoredLibs, setIgnoredLibs] = useLocalStorage<string[]>(
    "ignoredLibs",
    []
  )

  useEffect(() => {
    if (!input.trim()) {
      setError(null)
    }
  }, [input])

  function handleOnChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
  }

  function validateName(name: string): boolean {
    return /[\w-]+/.test(name)
  }

  function validateVersion(version: string): boolean {
    return /^\d+(.\d+)?(.\d+)?$/.test(version)
  }

  function validate({ name, from, to }: Library): boolean {
    return validateName(name) && validateVersion(from) && validateVersion(to)
  }

  const withoutIgnored = (library: Library): boolean => {
    return !ignoredLibs.includes(library.name)
  }

  const parseLibraries = (str: string): Library[] => {
    if (!str) return []

    let output: Library[] = []

    try {
      output = str
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map(
          (line): Library => {
            const [name, versionFrom, , versionTo] = line.split(/ +/)
            return {
              name,
              from: versionFrom.replace(/\^|~/, ""),
              to: versionTo.replace(/\^|~/, ""),
            }
          }
        )
        .map((library) => {
          if (!validate(library)) {
            throw Error("invalid output")
          }

          return library
        })

      if (error) {
        setError(null)
      }
    } catch (e) {
      console.log(e)
      setError("This doesn't look like a valid npx npm-check-updates output.")
    }

    return output
  }

  function generateOutput(str: string): string {
    const install = packageManager === "npm" ? "npm i" : "yarn"
    const bumpLibrary = ({ name, to }: Library): string =>
      `npx npm-check-updates -u ${name}; ${install}; git add -A; git commit -m "chore(deps): bump ${name} to ${to}"`

    const libraries = parseLibraries(str).filter(withoutIgnored)

    return libraries.map((library) => bumpLibrary(library)).join("; ")
  }

  const libraries = useMemo(() => {
    if (error || !input) {
      return parseLibraries(sampleInput)
    }
    return parseLibraries(input)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  function toggleIgnoreLibrary(libraryName: string): void {
    if (ignoredLibs.includes(libraryName)) {
      setIgnoredLibs(ignoredLibs.filter((lib) => lib !== libraryName))
    } else {
      setIgnoredLibs([...ignoredLibs, libraryName])
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="options">
          <div className="settings-label">Settings</div>

          <div className="section-title">Ignored libraries</div>
          <div
            className={`libraries ${!input ? "is-disabled" : ""}`}
            data-testid="libraries"
          >
            {libraries.map((library) => {
              return (
                <label
                  className="library"
                  data-testid="library"
                  key={library.name}
                >
                  <input
                    type="checkbox"
                    value={library.name}
                    checked={!ignoredLibs.includes(library.name)}
                    onChange={() => toggleIgnoreLibrary(library.name)}
                  />
                  <span>
                    {library.name} {library.from} → {library.to}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="input-output">
          <div className="inline-radios">
            <div className="inline-radio">
              <input
                data-testid="radio-yarn"
                id="yarn"
                type="radio"
                checked={packageManager === "yarn"}
                onChange={() => setPackageManager("yarn")}
              />
              <label htmlFor="yarn">Yarn</label>
            </div>
            <div className="inline-radio">
              <input
                data-testid="radio-npm"
                id="npm"
                type="radio"
                checked={packageManager === "npm"}
                onChange={() => setPackageManager("npm")}
              />
              <label htmlFor="npm">npm</label>
            </div>
          </div>

          <div className="input">
            <label htmlFor="input">
              Input
              <br />
              (copy/paste from <code>npx npm-check-updates</code>)
            </label>
            <textarea
              data-testid="input"
              id="input"
              value={input}
              onChange={handleOnChange}
              rows={10}
              placeholder={sampleInput}
            />
          </div>

          <div className="output">
            <label htmlFor="output">
              Output
              <br />
              (paste this in your terminal)
            </label>
            <textarea
              data-testid="output"
              id="output"
              value={error || generateOutput(input)}
              rows={10}
              readOnly
              className={error ? "has-error" : ""}
              placeholder={!error ? generateOutput(sampleInput) : undefined}
            />
          </div>

          <div className="see-on-github">
            <a
              href="https://github.com/veksen/npm-check-update-terminal-helper"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub /> <span className="text">Source on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
