export { playSound, stopAllSounds };
import { AssetStore } from "./assetStore";
var soundsPlaying = [] as HTMLAudioElement[];

function playSound(name: string): HTMLAudioElement {
    const audio = new Audio(AssetStore.sounds[name]);
    soundsPlaying.push(audio);
    audio.addEventListener("ended", () => {
        soundsPlaying = soundsPlaying.filter(sound => sound !== audio);
    }, { once: true });
    void audio.play().catch(() => {});
    return audio;
}

function stopAllSounds() {
    soundsPlaying.forEach(sound => {
        sound.pause();
    });
    soundsPlaying = [];
}
