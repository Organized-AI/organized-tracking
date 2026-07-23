// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

import type { OutputFormat } from "@organized-tracking/track-core";

/**
 * Global flags every `track` command accepts, per docs/cli-plan.md P0:
 * --no-input and --force suppress prompts for unattended/CI use;
 * -o/--output selects table (interactive) / json (piping) / plain (Unix pipes).
 */
export interface GlobalFlags {
  noInput: boolean;
  force: boolean;
  output?: OutputFormat;
}

const OUTPUT_FORMATS: OutputFormat[] = ["table", "json", "plain"];

export interface ParsedArgs {
  /** Positional args after global flags are stripped, e.g. ["campaign", "list"]. */
  positionals: string[];
  flags: GlobalFlags;
  /** Everything else, e.g. --name "My Ad" -> { name: "My Ad" }. */
  rest: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const rest: Record<string, string | boolean> = {};
  const flags: GlobalFlags = { noInput: false, force: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;

    if (arg === "--no-input") {
      flags.noInput = true;
    } else if (arg === "--force") {
      flags.force = true;
    } else if (arg === "-o" || arg === "--output") {
      const value = argv[++i];
      if (!value || !OUTPUT_FORMATS.includes(value as OutputFormat)) {
        throw new Error(`--output must be one of: ${OUTPUT_FORMATS.join(", ")}`);
      }
      flags.output = value as OutputFormat;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        rest[key] = next;
        i++;
      } else {
        rest[key] = true;
      }
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags, rest };
}
