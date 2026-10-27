import { Composition } from "remotion";
import { roomZero } from "./brand/tokens";
import { defaultSceneUnderScene, defaultSignalTest, defaultSocialCode } from "./content/defaults";
import { SceneUnderScene } from "./templates/SceneUnderScene";
import { SignalTest } from "./templates/SignalTest";
import { SocialCode } from "./templates/SocialCode";

export function RoomZeroStudio() {
  const common = {
    durationInFrames: roomZero.video.durationInFrames,
    fps: roomZero.video.fps,
    height: roomZero.video.height,
    width: roomZero.video.width,
  };

  return (
    <>
      <Composition id="RoomZeroSignalTest" component={SignalTest} defaultProps={defaultSignalTest} {...common} />
      <Composition id="RoomZeroSceneUnderScene" component={SceneUnderScene} defaultProps={defaultSceneUnderScene} {...common} />
      <Composition id="RoomZeroSocialCode" component={SocialCode} defaultProps={defaultSocialCode} {...common} />
    </>
  );
}
