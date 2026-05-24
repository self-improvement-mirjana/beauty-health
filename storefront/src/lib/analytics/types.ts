export type AnalyticsIngestEvent = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  source: 'storefront';
  actorType: 'guest' | 'user';
  actorId?: string | null;
  sessionId?: string | null;
  correlationId?: string | null;
  schemaVersion: 'v1';
  payload: Record<string, unknown>;
};

export type AnalyticsTrackPayload = Record<string, unknown>;
