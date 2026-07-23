// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Exit code convention for every `track` command, per docs/cli-plan.md P0.
 * Scripts and CI depend on these being stable across all executors.
 */
export const ExitCode = {
  /** Command completed successfully. */
  Success: 0,
  /** Generic/unclassified failure. */
  GeneralError: 1,
  /** Bad arguments, missing required flags, invalid config shape. */
  UsageError: 2,
  /** Missing or invalid credentials (.env, ADC, system-user token). */
  AuthError: 3,
  /** Upstream API rejected the request (4xx from GTM/GA4/Meta/Stape). */
  ApiError: 4,
  /** Publish blocked — the debug-agent gate did not return green. */
  GateBlocked: 5,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

export class TrackError extends Error {
  constructor(
    message: string,
    public readonly exitCode: ExitCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "TrackError";
  }
}
