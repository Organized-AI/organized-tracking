// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Write-executor contract behind `track gtm *`.
 * Default implementation: GWS CLI (@googleworkspace/cli). Direct GTM API v2
 * backs operations gws handles awkwardly (batch ops, template installs,
 * exact workspace -> version -> publish sequencing).
 * See docs/gtm-container-builds.md.
 */
export interface GtmContainer {
  accountId: string;
  containerId: string;
  publicId: string;
  name: string;
}

export interface GtmWorkspace {
  containerId: string;
  workspaceId: string;
  name: string;
}

export interface GtmVersion {
  containerId: string;
  containerVersionId: string;
  name?: string;
}

export interface GtmClient {
  listContainers(accountId: string): Promise<GtmContainer[]>;
  getContainer(accountId: string, containerId: string): Promise<GtmContainer>;

  createWorkspace(containerId: string, name: string): Promise<GtmWorkspace>;
  listWorkspaces(containerId: string): Promise<GtmWorkspace[]>;

  /** Installs a Stape (or other) custom template into a workspace. */
  installTemplate(
    workspaceId: string,
    templateGalleryReference: { owner: string; repository: string; version?: string },
  ): Promise<void>;

  /** Creates a container version from a workspace and publishes it. */
  publish(workspaceId: string): Promise<GtmVersion>;
}
