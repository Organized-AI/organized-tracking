// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Write-executor contract behind `track meta *`.
 * Default implementation: Meta Ads CLI (official, peer-installed).
 * See docs/meta-ads-integration.md.
 */
export interface MetaCampaign {
  id: string;
  accountId: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
}

export interface MetaDataset {
  id: string;
  accountId: string;
  name: string;
}

export interface MetaClient {
  listCampaigns(accountId: string): Promise<MetaCampaign[]>;
  createCampaign(accountId: string, input: Record<string, unknown>): Promise<MetaCampaign>;
  updateCampaign(campaignId: string, input: Record<string, unknown>): Promise<MetaCampaign>;
  deleteCampaign(campaignId: string): Promise<void>;

  /** Dataset = Pixel. Interlocks with `track add meta-capi` (data-tag/data-client). */
  createDataset(accountId: string, name: string): Promise<MetaDataset>;
  connectDataset(datasetId: string, accountId: string): Promise<void>;

  getInsights(
    entityId: string,
    params: { dateRange: [string, string]; fields: string[]; breakdowns?: string[] },
  ): Promise<Record<string, unknown>[]>;
}
