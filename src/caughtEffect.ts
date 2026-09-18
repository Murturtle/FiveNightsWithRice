import atlasUrl from "./scare/nightmare-atlas.png";
import { playSound, stopAllSounds } from "./soundHelper";
import { TimeManager } from "./offTabFrameFix";

const atlas = new Image();
atlas.src = atlasUrl;
const noise = document.createElement("canvas");
noise.width = 160;
noise.height = 90;
const noiseContext = noise.getContext("2d")!;
const grain = noiseContext.createImageData(160, 90);
const pixels = new Uint32Array(grain.data.buffer);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
export const CAUGHT_DURATION = 3600;
const IMPACT_AT = 380;
let startedAt = 0;
let attacker = 0;
let impacted = false;
let audioContext: AudioContext | null = null;
let audioNodes: AudioScheduledSourceNode[] = [];
let lastGrain = -1;

export function unlockCaughtAudio() {
    try {
        audioContext ??= new AudioContext();
        if (audioContext.state === "suspended") void audioContext.resume().catch(() => {});
    } catch {}
}

export function stopCaughtEffect() {
    for (const node of audioNodes) {
        try { node.stop(); } catch {}
        node.disconnect();
    }
    audioNodes = [];
}

export function beginCaughtEffect(index: number) {
    stopAllSounds();
    stopCaughtEffect();
    attacker = Math.max(0, Math.min(3, index));
    startedAt = TimeManager.getTime();
    impacted = false;
    lastGrain = -1;
}

function impactSound() {
    const voice = playSound(["rice", "sherwood", "profit", "neeway"][attacker]);
    voice.volume = 0.5;
    voice.playbackRate = 0.78;
    if (!audioContext || audioContext.state !== "running") return;
    const ac = audioContext;
    const now = ac.currentTime;
    const master = ac.createGain();
    const limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.ratio.value = 12;
    master.gain.setValueAtTime(0.001, now);
    master.gain.exponentialRampToValueAtTime(0.5, now + 0.018);
    master.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    master.connect(limiter).connect(ac.destination);
    const boom = ac.createOscillator();
    boom.type = "triangle";
    boom.frequency.setValueAtTime(145, now);
    boom.frequency.exponentialRampToValueAtTime(29, now + 0.65);
    boom.connect(master);
    const scrape = ac.createBufferSource();
    const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * 1.6), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    scrape.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.8;
    filter.frequency.setValueAtTime(2300, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.5);
    scrape.connect(filter).connect(master);
    audioNodes = [boom, scrape];
    let remaining = audioNodes.length;
    for (const node of audioNodes) {
        node.onended = () => {
            node.disconnect();
            if (--remaining === 0) { filter.disconnect(); master.disconnect(); limiter.disconnect(); }
        };
        node.start(now);
        node.stop(now + 1.6);
    }
}

export function pauseCaughtAudio() {
    if (audioContext?.state === "running") void audioContext.suspend().catch(() => {});
}

export function resumeCaughtAudio() {
    if (audioContext?.state === "suspended") void audioContext.resume().catch(() => {});
}

export function renderCaughtEffect(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): boolean {
    const elapsed = TimeManager.getTime() - startedAt;
    const w = canvas.width, h = canvas.height;
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    if (elapsed >= IMPACT_AT && !impacted) {
        impacted = true;
        impactSound();
    }
    const t = Math.max(0, elapsed - IMPACT_AT);
    if (elapsed >= IMPACT_AT && elapsed < 2400 && atlas.complete && atlas.naturalWidth > 0) {
        const lunge = 1 - Math.pow(1 - Math.min(t / 170, 1), 3);
        const secondLunge = Math.max(0, Math.min((t - 720) / 190, 1));
        const size = Math.max(w * 0.86, h * 1.28) * (reducedMotion.matches ? 1 : 0.62 + lunge * 0.46 + secondLunge * 0.2);
        const shake = reducedMotion.matches ? 0 : 17 * Math.exp(-t / 750) + 2;
        const dx = Math.sin(t * 0.071) * shake;
        const dy = Math.cos(t * 0.093) * shake * 0.55;
        const tile = atlas.naturalWidth / 2;
        const tileH = atlas.naturalHeight / 2;
        const sx = (attacker % 2) * tile;
        const sy = Math.floor(attacker / 2) * tileH;
        ctx.translate(w / 2 + dx, h / 2 + dy);
        ctx.rotate(reducedMotion.matches ? 0 : Math.sin(t * 0.039) * 0.025 * Math.exp(-t / 1200));
        ctx.filter = "grayscale(0.65) contrast(1.65) brightness(0.82)";
        ctx.drawImage(atlas, sx, sy, tile, tileH, -size / 2, -size * 0.46, size, size);
        ctx.filter = "none";
        if (!reducedMotion.matches) {
            ctx.globalAlpha = 0.48;
            for (let i = 0; i < 4; i++) {
                const band = (0.13 + i * 0.21 + Math.sin(t * 0.004 + i) * 0.035);
                const offset = Math.sin(t * 0.027 + i * 4) * 26;
                ctx.drawImage(atlas, sx, sy + tileH * band, tile, tileH * 0.025,
                    -size / 2 + offset, -size * 0.46 + size * band, size, size * 0.025);
            }
        }
        ctx.globalAlpha = 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const vignette = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.1, w / 2, h / 2, Math.max(w, h) * 0.65);
        vignette.addColorStop(0, "transparent");
        vignette.addColorStop(1, "#000");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = `rgba(45,0,0,${0.13 * Math.exp(-t / 900)})`;
        ctx.fillRect(0, 0, w, h);
    }
    if (Math.floor(elapsed / 65) !== lastGrain) {
        lastGrain = Math.floor(elapsed / 65);
        for (let i = 0; i < pixels.length; i++) {
            const v = Math.random() * 180 | 0;
            pixels[i] = (255 << 24) | (v << 16) | (v << 8) | v;
        }
        noiseContext.putImageData(grain, 0, 0);
    }
    ctx.globalAlpha = elapsed < IMPACT_AT ? 0.025 : elapsed < 2300 ? 0.12 : Math.max(0, (3000 - elapsed) / 700) * 0.18;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(noise, 0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    for (let y = 0; y < h; y += 5) ctx.fillRect(0, y, w, 1);
    if (elapsed > 1900) {
        ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (elapsed - 1900) / 550)})`;
        ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
    return elapsed >= CAUGHT_DURATION;
}
