export { playSound, stopAllSounds };
import { AssetStore } from "./assetStore";
var soundsPlaying = [] as HTMLAudioElement[];

function playSound(name: string): HTMLAudioElement {
    const audio = new Audio(AssetStore.sounds[name]);
    soundsPlaying.push(audio);
    audio.play();
    return audio;
}

function stopAllSounds() {
    soundsPlaying.forEach(sound => {
        sound.pause();
    });
    soundsPlaying = [];
}