const cCanvas = document.createElement("canvas");

cCanvas.id = "gamecanvas";

cCanvas.style.position = "fixed";
cCanvas.style.top = "0";
cCanvas.style.left = "0";
cCanvas.style.bottom = "0";
cCanvas.style.right = "0";
cCanvas.style.width = "100%";
cCanvas.style.height = "100%";
cCanvas.style.border = "none";
cCanvas.style.margin = "0";
cCanvas.style.padding = "0";
cCanvas.style.overflow = "hidden";
cCanvas.style.zIndex = "999999";

document.body.appendChild(cCanvas);


const queryString = window.location.search; 

const urlParams = new URLSearchParams(queryString);


if(urlParams.has("debug")) {
    StateManager.debug = true;
}

import { drawMainMenu } from "./mainmenu";
import { renderStaticPassive, renderFade, startFade, renderStatic, clearStatic, startSixTransition, startStatic } from "./renderHelper";
import { StateManager, State } from "./gameState";
import { renderInGame } from "./renderInGame";
import { CharacterModel } from "./characterModel";
import { AssetStore } from "./assetStore";
import { playSound } from "./soundHelper";
import { TimeManager } from "./offTabFrameFix";
import { renderLaunch } from "./renderLaunch";

const canvas = document.getElementById("gamecanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d")!; // the ! supresses null error

var lastTime = TimeManager.getTime();
var frameTime = 0;
var sixtyFpsTime = 0;
var secondAccumulator = 0;
const SECOND_MS = 1000;
const TARGET_SIXTY_FPS = 1000 / 20;
var updateSixty = false;

var mouseX = 0;
var mouseY = 0;
var mouseClicked = false;
var mouseFirstMove = false;
var mouseFirstClick = false;

// RICE
var bigRice = new CharacterModel();
bigRice.setSpawnLocation(4);
bigRice.setCamPos([[1100, 210, .45], [869, 356, 0.15], [306, 200, 0.35], [597, 383, 0.075], [630, 351, 0.1], [730, 429, 0.15], [1000, 400, 0.5], [800, 356, 0.15], [572, 310, 0.5], [425, 361, 0.25]]);
bigRice.setValidNights([true, true, true, true, true]); // CAM 9 NOT DONE
const riceThree = new Image();
riceThree.src = AssetStore.images["rice3"];
const riceTwo = new Image();
riceTwo.src = AssetStore.images["rice2"];
const riceOne = new Image();
riceOne.src = AssetStore.images["rice"];

bigRice.setCooldown(17000);

bigRice.setImages([riceThree, riceOne, riceThree, riceTwo, riceOne, riceOne, riceThree, riceThree, riceTwo, riceTwo]);
StateManager.addDiddy(bigRice);
// END RICE

// SHERWOOD
var bigWood = new CharacterModel();
bigWood.setSpawnLocation(7);
bigWood.setCamPos([[1100, 270, .35], [1078, 380, .15], [470, 200, .15], [1020, 541, .5], [750, 700, .55], [1105, 465, .15], [660, 440, .45], [1124, 626, .45], [650, 510, .35], [550, 320, .35]])
bigWood.setValidNights([false, true, true, false, true])
const woodOne = new Image();
woodOne.src = AssetStore.images["wood1"];
bigWood.setImages([woodOne, woodOne, woodOne, woodOne, woodOne, woodOne, woodOne, woodOne, woodOne, woodOne]);

bigWood.setCooldown(13000);
StateManager.addDiddy(bigWood);
// END SHERWOOD

// PROFIT
var bigProfit = new CharacterModel();
bigProfit.setSpawnLocation(8);
bigProfit.setCamPos([[1000,311,.35],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[1082,364,0.20],[0,0,0]]);
bigProfit.setValidNights([false, false, true, true, true]);
const profitOne = new Image();
profitOne.src = AssetStore.images["profit1"];
bigProfit.setImages([profitOne, profitOne, profitOne, profitOne, profitOne, profitOne, profitOne, profitOne, profitOne, profitOne]);

bigProfit.setCooldown(45000);

StateManager.addDiddy(bigProfit);

// END PROFIT


// NEEWAY
var bigNeeway = new CharacterModel();
bigNeeway.setSpawnLocation(9);
bigNeeway.setCamPos([[1100, 270, .35], [628, 386, .45], [445, 310, .55], [522, 408, .25], [534, 497, .35], [971, 495, .25], [660, 640, .75], [867, 830, .55], [604, 732, .65], [332, 305, .35]]);
bigNeeway.setValidNights([false, false, false, true, true]);
const neewayOne = new Image();
neewayOne.src = AssetStore.images["neeway1"];
bigNeeway.setImages([neewayOne, neewayOne, neewayOne, neewayOne, neewayOne, neewayOne, neewayOne, neewayOne, neewayOne, neewayOne]);

bigNeeway.setCooldown(15000);

StateManager.addDiddy(bigNeeway);

// END Neeway

const bestNightLS = localStorage.getItem("bestNight");

if(bestNightLS != null) {
    StateManager.setBestNight(parseInt(bestNightLS));
} else {
    localStorage.setItem("bestNight", "1");
}




function updateFrame() {


    const now = TimeManager.getTime();
    frameTime = now - lastTime;
    const fps = Math.round(1000 / frameTime);
    lastTime = now;

    if (StateManager.current() == State.Playing) {
        const prevBat = StateManager.getBatteryLevel();
        StateManager.tickCharacters();
        if (StateManager.getTimeHours() == 6) {
            StateManager.winNight();
        }

        secondAccumulator += frameTime;
        while (secondAccumulator >= SECOND_MS) {
            if (StateManager.isDoorClosed()) {
                StateManager.reduceBatteryLevel(1.5);
            }
            if (StateManager.getCurrentView() != 0) {
                if(StateManager.getCurrentView() == 1) {
                    StateManager.reduceBatteryLevel(0.75);
                } else {
                    StateManager.reduceBatteryLevel(0.25);
                }
            }
            secondAccumulator -= SECOND_MS;
        }

        if (StateManager.getBatteryLevel() <= 0 && prevBat > 0) {
            StateManager.setDoorState(false);
            playSound("cblowbat")
            bigRice.setLocation(1);
            StateManager.setCurrentView(0);
            StateManager.setDoorState(false);
        }

        if (StateManager.getBatteryLevel() <= 20 && prevBat > 20) {
            playSound("cblowbat");
        }

        if (StateManager.getTimeHours() > 6 && StateManager.getTimeHours() != 12) {
            bigRice.setLocation(0);
        }

    }




    sixtyFpsTime += frameTime;
    updateSixty = sixtyFpsTime >= TARGET_SIXTY_FPS;
    if (updateSixty) {
        sixtyFpsTime = 0;
    }

    if (StateManager.getCurrentView() == 0) {
        if(StateManager.current() == State.Playing) {
            clearStatic();
        }
    }

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (StateManager.current() == State.Launching) {
        renderLaunch(canvas, ctx, updateSixty, mouseClicked);
    }

    if (StateManager.current() == State.MainMenu) {
        drawMainMenu(canvas, ctx, updateSixty, mouseX, mouseY, mouseClicked, mouseFirstMove);
    }

    if (StateManager.current() == State.Playing) {
        renderInGame(canvas, ctx, updateSixty, mouseX, mouseY, mouseClicked);
    }

    
    
    if (StateManager.debug) {
        ctx.save();

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";

        ctx.fillText(`FPS: ${fps}`, 10, 20);
        ctx.fillText(`Frame: ${frameTime.toFixed(2)}ms`, 10, 40);

        ctx.fillText(
            `Canvas: ${canvas.width}x${canvas.height}`,
            10, 60
        );

        ctx.fillText(
            `Window: ${window.innerWidth}x${window.innerHeight}`,
            10, 80
        );

        ctx.fillText(
            `Screen: ${screen.width}x${screen.height}`,
            10, 100
        );

        ctx.fillText(
            `Focus: ${document.hasFocus() ? "Yes" : "No"}`,
            10, 120
        );

        ctx.fillText(
            `Page: ${document.visibilityState}`,
            10, 140
        );

        ctx.fillText(
            `Best Night: ${StateManager.getBestNight()}`,
            10, 180
        );

        ctx.fillText(
            `State: ${State[StateManager.current()]}`,
            10, 200
        );

        ctx.restore();
    }
    

    ctx.fillStyle = "white";
    if (mouseClicked) {
        ctx.strokeStyle = "yellow";
    } else {
        ctx.strokeStyle = "black";
    }

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    if(mouseFirstMove) {
        ctx.strokeText(`X`, mouseX - ctx.measureText("X").width / 2, mouseY + 8);
        ctx.fillText(`X`, mouseX - ctx.measureText("X").width / 2, mouseY + 8);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = "none";
    mouseClicked = false;

    requestAnimationFrame(updateFrame);
}

document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if(!mouseFirstMove) {
        mouseFirstMove = true;
    }
});

document.addEventListener("mousedown", (event) => {
    console.log(`clicked: (${event.clientX}, ${event.clientY})`);
    mouseClicked = true;
    if(!mouseFirstClick) {
        mouseFirstClick = true;
    }
});

window.addEventListener("blur", () => {
    TimeManager.switchedOffTab();
})

window.addEventListener("focus", () => {
    TimeManager.switchedToTab();
})

window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvas = document.getElementById("gamecanvas") as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;

});

StateManager.resetGame();
if(!StateManager.debug) {
    StateManager.setState(State.Launching);
} else {
    StateManager.setState(State.MainMenu);
}

startStatic(0);
clearStatic();
document.body.style.cursor = "none";
requestAnimationFrame(updateFrame);

