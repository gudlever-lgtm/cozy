import { assets } from "./assets";
import { useAudioPlayer } from "expo-audio";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
export function Audio({
  music,
  sound,
  victoryId,
}: {
  music: boolean;
  sound: boolean;
  victoryId?: string | null;
}) {
  const chime = useAudioPlayer(assets.audio.victory);
  const previousVictory = useRef(victoryId);
  useEffect(() => {
    if (victoryId && victoryId !== previousVictory.current && sound)
      void chime
        .seekTo(0)
        .then(() => chime.play())
        .catch(() => {});
    previousVictory.current = victoryId;
  }, [victoryId, sound, chime]);
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
    else {
      nature.pause();
      chime.pause();
    }
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        melody.pause();
        nature.pause();
        chime.pause();
      } else {
        if (music) melody.play();
        if (sound) nature.play();
      }
    });
    return () => subscription.remove();
  }, [music, sound, melody, nature, chime]);
  return null;
}
