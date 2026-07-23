// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Capability manifest shape consumed by packages/track-registry.
 * See docs/stape-registry.md — capability -> template(s) + dependencies +
 * params + container target, fetched and version-pinned from upstream at
 * `track add` time rather than vendored.
 */
export interface CapabilityTemplateRef {
  owner: string;
  repository: string;
  /** Pinned upstream ref (tag/sha); resolved and recorded at `track add` time. */
  version?: string;
}

export interface CapabilityManifestEntry {
  capability: string;
  templates: CapabilityTemplateRef[];
  /** Other capabilities this one depends on (e.g. meta-capi -> user-data-extractor-variable). */
  dependsOn?: string[];
  containerTarget: "web" | "server" | "both";
  params?: Record<string, { required: boolean; description: string }>;
}

export interface BusinessPreset {
  name: string;
  capabilities: string[];
}
