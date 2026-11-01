import { assets } from "./assets";
import { useAudioPlayer } from "expo-audio";
import { useEffect } from "react";
import { AppState } from "react-native";
export function Audio({ music, sound }: { music: boolean; sound: boolean }) {
  const melody = useAudioPlayer(assets.audio.music);
  const nature = useAudioPlayer(assets.audio.nature);
  useEffect(() => {
    melody.loop = true;
    melody.volume = 0.35;
    nature.loop = true;
    nature.volume = 0.3;
  }, [melody, nature]);
  useEffect(() => {
    if (music) melody.play();
    else melody.pause();
    if (sound) nature.play();
    else nature.pause();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        melody.pause();
        nature.pause();
      } else {
        if (music) melody.play();
        if (sound) nature.play();
      }
    });
    return () => subscription.remove();
  }, [music, sound, melody, nature]);
  return null;
}
