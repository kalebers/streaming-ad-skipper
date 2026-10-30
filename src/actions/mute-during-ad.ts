export interface AudioMuteState {
  previousMuted: boolean | null;
}

export function muteForAdvertisement(
  video: HTMLVideoElement,
  state: AudioMuteState
): boolean {
  if (state.previousMuted === null) state.previousMuted = video.muted;
  if (!video.muted) video.muted = true;
  return true;
}

export function restoreAfterAdvertisement(
  video: HTMLVideoElement | null,
  state: AudioMuteState
): boolean {
  if (state.previousMuted === null) return false;
  if (video) video.muted = state.previousMuted;
  state.previousMuted = null;
  return true;
}
