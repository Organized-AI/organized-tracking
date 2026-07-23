// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Write-executor contract behind `track stape *`.
 * Default implementation: the Stape API (api.stape.io, buyer's own key).
 * Covers sGTM container lifecycle, custom domains, and CAPI Gateway
 * containers. See docs/stape-provisioning.md.
 */
export interface StapeContainer {
  id: string;
  taggingServerUrl: string;
  plan: string;
  region: string;
}

export interface StapeClient {
  createContainer(input: { plan: string; region: string }): Promise<StapeContainer>;
  updateContainer(containerId: string, input: Record<string, unknown>): Promise<StapeContainer>;
  deleteContainer(containerId: string): Promise<void>;
  transferContainer(containerId: string, toAccountId: string): Promise<void>;

  changePlan(containerId: string, plan: string): Promise<StapeContainer>;

  addCustomDomain(containerId: string, domain: string): Promise<void>;

  createCapiGateway(input: { plan: string; region: string }): Promise<StapeContainer>;
}
