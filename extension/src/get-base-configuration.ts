import type * as vscode from "vscode"
import { supportsESM } from "./is-esm"

const configurations: {
  [k: string]: vscode.DebugConfiguration
} = {
  typescript: {
    name: "Launch Program",
    type: "node",
    request: "launch",
    runtimeExecutable: "node",
    skipFiles: [
      "<node_internals>/**",
      "**/node_modules/@temporalio/worker/src/**",
      "**/node_modules/@temporalio/worker/lib/**",
      "**/node_modules/@temporalio/common/src/**",
      "**/node_modules/@temporalio/common/lib/**",
      "**/node_modules/**/source-map/**",
    ],
    internalConsoleOptions: "openOnSessionStart",
    pauseForSourceMap: true,
  },

  python: {
    name: "Python test config",
    type: "debugpy",
    request: "launch",
    internalConsoleOptions: "openOnSessionStart",
    pauseForSourceMap: true,
    // program: "${file}", // not entirely sure about this
    skipFiles: [
      // TODO file exclusion lists
      // site-packages, sdk code
      // also can be applied to enhanced stack trace internals
    ],
  },
}

export const getBaseConfiguration = async (): Promise<vscode.DebugConfiguration> => {
  const runtimeArgs = (await supportsESM())
    ? ["--loader=ts-node/esm"]
    : ["--nolazy", "-r", "ts-node/register/transpile-only"]

  return { ...configurations.typescript, runtimeArgs }
}

export const getConfiguration = async (lang: string): Promise<vscode.DebugConfiguration> => {
  const extras: { [k: string]: any } = {}
  let config: vscode.DebugConfiguration

  switch (lang) {
    case "typescript": {
      const runtimeArgs = (await supportsESM())
        ? ["--loader=ts-node/esm"]
        : ["--nolazy", "-r", "ts-node/register/transpile-only"]

      extras.runtimeArgs = runtimeArgs
      config = configurations.typescript

      break
    }
    case "python": {
      config = configurations.python

      break
    }
    default: {
      throw TypeError // fallback default for now
    }
  }

  return { ...config, ...extras }
}
