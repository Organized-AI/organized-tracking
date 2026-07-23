// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

import type { ParsedArgs } from "./flags.js";

/**
 * `track <noun> <verb> [options]` dispatch, per README.md's command grammar.
 * Individual resource commands (campaign, adset, container, dataset, ...)
 * register their verbs here as P1-P5 executors land; this file only owns
 * the noun -> verb -> handler lookup, not any resource logic.
 */
export type CommandHandler = (args: ParsedArgs) => Promise<void>;

const nouns = new Map<string, Map<string, CommandHandler>>();

export function registerCommand(noun: string, verb: string, handler: CommandHandler): void {
  if (!nouns.has(noun)) nouns.set(noun, new Map());
  nouns.get(noun)!.set(verb, handler);
}

export function getCommand(noun: string, verb: string): CommandHandler | undefined {
  return nouns.get(noun)?.get(verb);
}

export function listNouns(): string[] {
  return [...nouns.keys()];
}

export function listVerbs(noun: string): string[] {
  return [...(nouns.get(noun)?.keys() ?? [])];
}
