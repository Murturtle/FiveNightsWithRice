export { renderStaticPassive }

import { TimeManager } from "./offTabFrameFix";

var staticRand = 40;

var lightRand = 0.125;

function renderStaticPassive(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, updateSixty: boolean, actuallyStatic: boolean = true) {
    ctx.fillStyle = "#0000007e"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (updateSixty) {
        staticRand += Math.random() * 10 - 5;
        if (staticRand < 30) staticRand = 30;
        if (staticRand > 50) staticRand = 50;
    }

    if (actuallyStatic) {
        for (let i = 0; i < canvas.height; i += staticRand) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
            ctx.fillRect(0, i, canvas.width, 2);
        }
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const maxRadius = Math.max(canvas.width, canvas.height) * 0.75;

    const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        maxRadius
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.6, "rgba(0,0,0,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0.7)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var fadeTimeStart = -100000;
var duration = 1000;

export function startFade(durationMs: number) {
    fadeTimeStart = TimeManager.getTime();
    duration = durationMs;
}

export function renderFade(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const now = TimeManager.getTime();
    const elapsed = now - fadeTimeStart;
    let alpha = 1 - elapsed / duration;
    if (alpha < 0) alpha = 0;
    if (alpha > 1) alpha = 1;

    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let staticTimeNow = -100000;
let staticDurationMs = 1000;

let noiseCanvas: HTMLCanvasElement | null = null;
let noiseCtx: CanvasRenderingContext2D | null = null;
let noiseImageData: ImageData | null = null;
let noiseBuffer: Uint32Array | null = null;

let noiseW = 0;
let noiseH = 0;

export function renderStatic(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    updateSixty: boolean
) {
    if (TimeManager.getTime() - staticTimeNow > staticDurationMs) {
        return;
    }
    const fullW = canvas.width;
    const fullH = canvas.height;

    const width = Math.floor(fullW / 8);
    const height = Math.floor(fullH / 8);

    if (!noiseCanvas || noiseW !== width || noiseH !== height) {
        noiseW = width;
        noiseH = height;

        noiseCanvas = document.createElement("canvas");
        noiseCanvas.width = width;
        noiseCanvas.height = height;

        noiseCtx = noiseCanvas.getContext("2d")!;
        noiseImageData = noiseCtx.createImageData(width, height);
        noiseBuffer = new Uint32Array(noiseImageData.data.buffer);
    }

    if (updateSixty && noiseBuffer && noiseImageData && noiseCtx) {
        for (let i = 0; i < noiseBuffer.length; i++) {
            const shade = (Math.random() * 255) | 0;

            noiseBuffer[i] =
                (255 << 24) |
                (shade << 16) |
                (shade << 8) |
                shade;
        }

        noiseCtx.putImageData(noiseImageData, 0, 0);
    }

    if (!noiseCanvas) return;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(noiseCanvas, 0, 0, fullW, fullH);
}

export function startStatic(staticDuration: number = 1000) {
    staticTimeNow = TimeManager.getTime();
    staticDurationMs = staticDuration;
}

export function clearStatic() {
    staticDurationMs = 0;
}


let sixTimeStart = -100000;
let sixDurationMs = 6000;


export function startSixTransition(duration: number = 6000) {
    sixTimeStart = TimeManager.getTime();
    sixDurationMs = duration;
}


export function renderSixTransition(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) {
    const now = TimeManager.getTime();
    const elapsed = now - sixTimeStart;

    if (elapsed > sixDurationMs) return;

    const progress = elapsed / sixDurationMs;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const showSix = progress > 0.5;

    const text = showSix ? "6:00" : "5:59";

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const fontSize = Math.max(canvas.width, canvas.height) * 0.4;
    ctx.font = `bold ${fontSize}px monospace`;

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const fadeAlpha =
        progress < 0.1
            ? progress / 0.1
            : progress > 0.9
                ? (1 - progress) / 0.1
                : 1;

    ctx.fillStyle = `rgba(0, 0, 0, ${1 - fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

export function renderLight(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    mouseX: number,
    mouseY: number,
    updateSixty: boolean
) {
    
    if(updateSixty) {
        lightRand = Math.random() *0.015 + 0.110;
    }
    ctx.save();
    ctx.fillStyle = "rgba(255,255,0,0.05)";
    const size = ((canvas.width * lightRand) + (canvas.height * lightRand)) * 0.3;
    ctx.beginPath();
    ctx.ellipse(mouseX, mouseY, size, size, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    const sizeTwo = ((canvas.width * lightRand * 1.2) + (canvas.height * lightRand * 1.2)) * 0.3;
    ctx.beginPath();
    ctx.ellipse(mouseX, mouseY, sizeTwo, sizeTwo, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
    
