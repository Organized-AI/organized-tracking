// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

/**
 * Write-executor contract behind `track ga4 *`.
 * Default implementation: ga-cli (MIT, peer-installed). Direct GA4 Admin API
 * backs the same hedge pattern as GtmClient; a future consolidation onto
 * GWS CLI (discovery-driven against analyticsadmin/analyticsdata) is flagged
 * for P5 rather than decided here. See docs/ga4-integration.md.
 */
export interface Ga4Stream {
  propertyId: string;
  streamId: string;
  measurementId: string;
  displayName: string;
}

export interface Ga4ConversionEvent {
  propertyId: string;
  eventName: string;
}

export interface Ga4Client {
  listProperties(accountId: string): Promise<{ propertyId: string; displayName: string }[]>;

  createStream(propertyId: string, displayName: string, uri?: string): Promise<Ga4Stream>;
  listStreams(propertyId: string): Promise<Ga4Stream[]>;

  createConversionEvent(propertyId: string, eventName: string): Promise<Ga4ConversionEvent>;

  /** Measurement Protocol API secret — what data-client/sGTM sends events with. */
  createMeasurementProtocolSecret(streamId: string, displayName: string): Promise<{ secretValue: string }>;
}
