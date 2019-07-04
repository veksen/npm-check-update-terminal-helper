import React, { ChangeEvent, useState } from "react";
import "./App.css";
import { ReactComponent as GitHub } from "./github.svg";

interface Library {
  name: string;
  version: string;
}

type PackageManager = "yarn" | "npm";

const sampleInput = `babel-plugin-styled-components  ^1.10.2  →  ^1.10.6
gatsby                          ^2.10.5  →  ^2.13.3
gatsby-image                     ^2.2.3  →   ^2.2.4
gatsby-plugin-manifest           ^2.2.0  →   ^2.2.1
gatsby-plugin-offline            ^2.2.0  →   ^2.2.1
gatsby-plugin-sharp              ^2.2.1  →   ^2.2.2
gatsby-source-filesystem         ^2.1.1  →   ^2.1.2
gatsby-transformer-sharp         ^2.2.0  →   ^2.2.1`;

function App() {
  const [input, setInput] = useState("");
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  function handleOnChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function parse(str: string) {
    const install = packageManager === "npm" ? "npm i" : "yarn";
    const bumpLibrary = ({ name, version }: Library): string =>
      `npx npm-check-updates -u ${name}; ${install}; git add -A; git commit -m "chore(deps): bump ${name} to ${version}"`;

    if (!str) return "";

    return str
      .split(/\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(
        (line): Library => {
          const [name, , , version] = line.split(/ +/);
          return {
            name,
            version: version.replace(/\^/, "")
          };
        }
      )
      .map(library => bumpLibrary(library))
      .join("; ");
  }

  const sampleOutput = parse(sampleInput);

  return (
    <div className="App">
      <div className="container">
        <div className="inline-radios">
          <div className="inline-radio">
            <input
              id="yarn"
              type="radio"
              checked={packageManager === "yarn"}
              onChange={() => setPackageManager("yarn")}
            />
            <label htmlFor="yarn">Yarn</label>
          </div>
          <div className="inline-radio">
            <input
              id="npm"
              type="radio"
              checked={packageManager === "npm"}
              onChange={() => setPackageManager("npm")}
            />
            <label htmlFor="npm">npm</label>
          </div>
        </div>

        <label htmlFor="input">
          Input (copy/paste from <code>npx npm-check-updates</code>)
        </label>
        <textarea
          id="input"
          value={input}
          onChange={handleOnChange}
          rows={10}
          placeholder={sampleInput}
        />

        <label htmlFor="output">Output (paste this in your console)</label>
        <textarea
          id="output"
          value={parse(input)}
          rows={10}
          readOnly
          placeholder={sampleOutput}
        />

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
  );
}

export default App;
