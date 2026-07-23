// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

import { ExitCode, TrackError } from "@organized-tracking/track-core";
import { parseArgs } from "./flags.js";
import { getCommand, listNouns, listVerbs } from "./registry.js";
import "./commands/version.js";

function printUsage(): void {
  console.error("Usage: track <noun> <verb> [options] [--no-input] [--force] [-o table|json|plain]");
  console.error(`Available nouns: ${listNouns().join(", ") || "(none registered yet)"}`);
}

export async function run(argv: string[]): Promise<number> {
  const args = parseArgs(argv);
  const [noun, verb] = args.positionals;

  if (!noun || !verb) {
    printUsage();
    return ExitCode.UsageError;
  }

  const handler = getCommand(noun, verb);
  if (!handler) {
    console.error(`Unknown command: track ${noun} ${verb}`);
    const verbs = listVerbs(noun);
    if (verbs.length > 0) {
      console.error(`Available verbs for "${noun}": ${verbs.join(", ")}`);
    } else {
      printUsage();
    }
    return ExitCode.UsageError;
  }

  try {
    await handler(args);
    return ExitCode.Success;
  } catch (err) {
    if (err instanceof TrackError) {
      console.error(err.message);
      return err.exitCode;
    }
    console.error(err instanceof Error ? err.message : String(err));
    return ExitCode.GeneralError;
  }
}
