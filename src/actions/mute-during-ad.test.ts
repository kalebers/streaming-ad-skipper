import { describe, expect, it } from "vitest";
import {
  muteForAdvertisement,
  restoreAfterAdvertisement,
  type AudioMuteState
} from "./mute-during-ad";

describe("advertisement audio state", () => {
  it("restores the user's previous unmuted state", () => {
    const video = document.createElement("video");
    const state: AudioMuteState = { previousMuted: null };

    muteForAdvertisement(video, state);
    expect(video.muted).toBe(true);
    expect(state.previousMuted).toBe(false);

    expect(restoreAfterAdvertisement(video, state)).toBe(true);
    expect(video.muted).toBe(false);
    expect(state.previousMuted).toBeNull();
  });

  it("preserves a video that was already muted", () => {
    const video = document.createElement("video");
    video.muted = true;
    const state: AudioMuteState = { previousMuted: null };

    muteForAdvertisement(video, state);
    restoreAfterAdvertisement(video, state);

    expect(video.muted).toBe(true);
  });
});
