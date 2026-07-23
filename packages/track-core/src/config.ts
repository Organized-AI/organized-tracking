// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Config precedence, per docs/cli-plan.md P0:
 *   per-command flag  >  .env  >  tracking.config.ts defaults
 *
 * No PII and no write credentials ever pass through a model — this module
 * only resolves plain config values (account IDs, container IDs, output
 * format); tokens are read straight from process.env by each executor and
 * are never logged or returned in a diffable config snapshot.
 */

export type OutputFormat = "table" | "json" | "plain";

export interface TrackingConfig {
  /** White-label brand token set (packages/track-brand consumes this). */
  brand?: string;
  /** Active business preset, e.g. "ecommerce-shopify". */
  preset?: string;
  /** Capabilities currently declared active (mirrors `track add`/`track remove`). */
  capabilities: string[];
  /** Default output format when a command doesn't pass --output explicitly. */
  defaultOutput: OutputFormat;
}

export interface ResolvedFlags {
  output?: OutputFormat;
  noInput?: boolean;
  force?: boolean;
  [key: string]: unknown;
}

/**
 * Merge flag > env > config-default precedence for a single scalar option.
 * `envKey` is looked up on `env` (defaults to process.env) verbatim — callers
 * decide the env var name so each executor's naming stays explicit.
 */
export function resolveOption<T>(
  flagValue: T | undefined,
  envKey: string | undefined,
  configDefault: T | undefined,
  env: Record<string, string | undefined> = process.env,
): T | undefined {
  if (flagValue !== undefined) return flagValue;
  if (envKey && env[envKey] !== undefined) return env[envKey] as unknown as T;
  return configDefault;
}

export function resolveOutputFormat(
  flags: ResolvedFlags,
  config: Pick<TrackingConfig, "defaultOutput">,
): OutputFormat {
  return resolveOption(flags.output, "TRACK_OUTPUT", config.defaultOutput) ?? "table";
}
