import { Asset } from "expo-asset";
import { useEffect, useRef } from "react";
// Browser autoplay policies require a gesture after a restored session.
export function Audio({ music, sound }: { music: boolean; sound: boolean }) {
  const tracks = useRef<HTMLAudioElement[]>([]);
  useEffect(() => {
    tracks.current = [
      new globalThis.Audio(
        Asset.fromModule(require("../assets/music.wav")).uri,
      ),
      new globalThis.Audio(
        Asset.fromModule(require("../assets/nature.wav")).uri,
      ),
    ];
    tracks.current.forEach((t) => {
      t.loop = true;
      t.volume = 0.3;
    });
    return () => tracks.current.forEach((t) => t.pause());
  }, []);
  useEffect(() => {
    const play = () =>
      tracks.current.forEach((track, i) => {
        if ((i === 0 ? music : sound) && !document.hidden)
          void track.play().catch(() => {});
        else track.pause();
      });
    play();
    document.addEventListener("pointerdown", play);
    document.addEventListener("visibilitychange", play);
    return () => {
      document.removeEventListener("pointerdown", play);
      document.removeEventListener("visibilitychange", play);
    };
  }, [music, sound]);
  return null;
}
