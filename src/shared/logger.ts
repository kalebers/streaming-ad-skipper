import type { ClassificationResult } from "./types";

export interface DiagnosticEntry {
  timestamp: number;
  adapter: string;
  playerAvailable: boolean;
  classification: ClassificationResult["classification"];
  confidence: number;
  evidenceIds: string[];
  action: string;
  result: string;
  reason?: string;
}

const entries: DiagnosticEntry[] = [];

export function recordDiagnostic(entry: DiagnosticEntry): void {
  const boundedEntry = { ...entry };
  if (boundedEntry.reason) boundedEntry.reason = boundedEntry.reason.slice(0, 200);
  entries.push(boundedEntry);
  if (entries.length > 100) entries.shift();
}

export function getDiagnostics(): readonly DiagnosticEntry[] {
  return entries;
}
