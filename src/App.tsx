/// <reference types="vite-plugin-svgr/client" />

import { ChangeEvent, useState, useEffect, useMemo } from "react"
import cx from "clsx"
import { useLocalStorage } from "./useLocalStorage"
import GitHub from "./github.svg?react"

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
  const [bumpLockfile, setBumpLockfile] = useLocalStorage<boolean>(
    "bumpLockfile",
    false
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
        .map((line): Library => {
          const [name, versionFrom, , versionTo] = line.split(/ +/)
          return {
            name,
            from: versionFrom.replace(/\^|~/, ""),
            to: versionTo.replace(/\^|~/, ""),
          }
        })
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

  function bumpLockfileOutput() {
    if (!bumpLockfile) {
      return ""
    }

    const install = packageManager === "npm" ? "npm i" : "yarn"
    const lockfile =
      packageManager === "npm" ? "package-lock.json" : "yarn.lock"

    return `rm ${lockfile}; ${install}; git add -A; git commit -m "chore(deps): bump lockfile"`
  }

  function generateOutput(str: string): string {
    const install = packageManager === "npm" ? "npm i" : "yarn"
    const bumpLibrary = ({ name, to }: Library): string =>
      `npx npm-check-updates -u ${name}; ${install}; git add -A; git commit -m "chore(deps): bump ${name} to ${to}"`
    const bumpedLockfile = bumpLockfileOutput()

    const libraries = parseLibraries(str).filter(withoutIgnored)

    return [...libraries.map((library) => bumpLibrary(library)), bumpedLockfile]
      .filter(Boolean)
      .join("; ")
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
    <div className="app mx-0 my-4">
      <div className="container mx-auto my-0 box-border flex w-full max-w-[1100px] px-8 py-0">
        <div className="options flex flex-[0_0_auto] flex-col gap-2 p-4">
          <div className="settings-label mb-4 h-[26px]">Settings</div>

          <div className="section-title">Ignored libraries</div>
          <div
            className={cx("libraries gap-1", {
              "pointer-events-none opacity-30": !input,
            })}
            data-testid="libraries"
          >
            {libraries.map((library) => {
              return (
                <label
                  className="library flex cursor-pointer items-center gap-1"
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
          <div
            className="section-title cursor-help"
            title={`Will delete and force recreate your ${
              packageManager === "npm" ? "package-lock.json" : "yarn.lock"
            } file.`}
          >
            Bump lockfile [?]
          </div>
          <label
            className="option flex cursor-pointer items-center gap-1"
            data-testid="bump-lockfile"
          >
            <input
              data-testid="bump-lockfile-checkbox"
              type="checkbox"
              value="bump-lockfile"
              checked={bumpLockfile}
              onChange={() => setBumpLockfile((prevValue) => !prevValue)}
            />
            <span>Bump</span>
          </label>
        </div>

        <div className="input-output w-[600px] flex-[0_0_600px] gap-4 p-4">
          <div className="inline-radios mb-4 flex h-[26px] gap-4">
            <div className="inline-radio flex">
              <input
                className="peer order-2 cursor-pointer"
                data-testid="radio-yarn"
                id="yarn"
                type="radio"
                checked={packageManager === "yarn"}
                onChange={() => setPackageManager("yarn")}
              />
              <label
                className="order-1 cursor-pointer pr-2 peer-checked:text-[blue]"
                htmlFor="yarn"
              >
                Yarn
              </label>
            </div>
            <div className="inline-radio flex">
              <input
                className="peer order-2 cursor-pointer"
                data-testid="radio-npm"
                id="npm"
                type="radio"
                checked={packageManager === "npm"}
                onChange={() => setPackageManager("npm")}
              />
              <label
                className="order-1 cursor-pointer pr-2 peer-checked:text-[blue]"
                htmlFor="npm"
              >
                npm
              </label>
            </div>
          </div>

          <div className="input flex flex-col gap-2">
            <label htmlFor="input">
              Input
              <br />
              (copy/paste from{" "}
              <code className="inline-block rounded-[3px] bg-[#eee] p-[3px] text-[90%]">
                npx npm-check-updates
              </code>
              )
            </label>
            <textarea
              data-testid="input"
              id="input"
              value={input}
              onChange={handleOnChange}
              rows={10}
              className="mb-8 w-full flex-[1_0_auto] resize-none border-[1px] border-solid border-black p-2 font-mono text-base leading-[1.2] placeholder:text-[#bbb]"
              placeholder={sampleInput}
            />
          </div>

          <div className="output flex flex-col gap-2">
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
              className={cx(
                "mb-8 w-full flex-[1_0_auto] resize-none border-[1px] border-solid border-black p-2 font-mono text-base leading-[1.2] placeholder:text-[#bbb]",
                {
                  "border-2 border-solid border-[#f00] text-[#f00]": error,
                }
              )}
              placeholder={!error ? generateOutput(sampleInput) : undefined}
            />
          </div>

          <div className="see-on-github">
            <a
              className="inline-flex items-center no-underline opacity-70 hover:opacity-100"
              href="https://github.com/veksen/npm-check-update-terminal-helper"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub className="mr-2 w-5" />
              <span className="text border-solid; border-b-2 border-b-[blue] text-[blue]">
                Source on GitHub
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
