import { PrimeVideoAdapter } from "./prime-video";
import type { StreamingAdapter } from "./types";

const adapters: StreamingAdapter[] = [new PrimeVideoAdapter()];

export function adapterFor(url: URL): StreamingAdapter | null {
  return adapters.find((adapter) => adapter.matches(url)) ?? null;
}
