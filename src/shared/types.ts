export type Classification = "unknown" | "content" | "advertisement";
export type EvidenceKind = "dom-label" | "player-state" | "metadata";

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  detail: string;
  confirmed: boolean;
  observedAt: number;
}

export interface ClassificationResult {
  classification: Classification;
  confidence: number;
  evidence: Evidence[];
  observedAt: number;
}

export interface Settings {
  enabled: boolean;
  services: { primeVideo: boolean };
  automaticSkip: boolean;
  muteDuringAds: boolean;
  diagnostics: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  services: { primeVideo: true },
  automaticSkip: true,
  muteDuringAds: false,
  diagnostics: false
};
