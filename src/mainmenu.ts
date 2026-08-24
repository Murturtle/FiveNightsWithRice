export { drawMainMenu };
import { State, StateManager } from "./gameState";
import { renderFade, renderStaticPassive, startFade, renderSixTransition, renderLight, renderStatic } from "./renderHelper";
import { playSound, stopAllSounds } from "./soundHelper";
import { TimeManager } from "./offTabFrameFix";

var lastHoverState = { start: false, resume: false, reset: false };

var audioBg: HTMLAudioElement | null = null;


function drawMainMenu(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, updateSixty: boolean, mouseX: number, mouseY: number, mouseClicked: boolean, mouseFirstMove: boolean) {
    ctx.fillStyle = "rgb(80, 0, 129)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (audioBg == null) {
        audioBg = playSound("title");
        audioBg.loop = true;
        audioBg.volume = 0.33
    }



    const riceImg = StateManager.getCharacters()[0].getImages()[3];
    const woodImg = StateManager.getCharacters()[1].getImages()[3];
    const profitImg = StateManager.getCharacters()[2].getImages()[0];
    const neewayImg = StateManager.getCharacters()[3].getImages()[0];

    const bestNight = StateManager.getBestNight();
    const targetHeight = canvas.height / 3;

    let currentX = canvas.width * 0.95;
    const imgY = canvas.height * 0.6 - targetHeight / 2;

    if (StateManager.getCharacters()[0].getValidNight(bestNight) && riceImg && riceImg.width > 0 && riceImg.height > 0) {


        const riceAspect = riceImg.width / riceImg.height;
        const riceWidth = targetHeight * riceAspect;

        const riceX = currentX - riceWidth;

        ctx.drawImage(riceImg, riceX, imgY + Math.sin(TimeManager.getTime() / 1000) * 10, riceWidth, targetHeight);

        currentX = riceX;
    }

    if (
        StateManager.getCharacters()[1].getValidNight(bestNight) &&
        woodImg &&
        woodImg.width > 0 &&
        woodImg.height > 0
    ) {

        const woodAspect = woodImg.width / woodImg.height;
        const woodWidth = targetHeight * woodAspect;

        const woodX = currentX - woodWidth;

        ctx.drawImage(woodImg, woodX, imgY + Math.sin(TimeManager.getTime() / 1000 + 150) * 10, woodWidth, targetHeight);

        currentX = woodX;
    }

    if (
        StateManager.getCharacters()[2].getValidNight(bestNight) &&
        profitImg &&
        profitImg.width > 0 &&
        profitImg.height > 0
    ) {

        const profitAspect = profitImg.width / profitImg.height;
        const profitWidth = targetHeight * profitAspect;

        const profitX = currentX - profitWidth;

        ctx.drawImage(profitImg, profitX, imgY + Math.sin(TimeManager.getTime() / 1000 + 300) * 10, profitWidth, targetHeight);

        currentX = profitX
    }

    if (
        StateManager.getCharacters()[3].getValidNight(bestNight) &&
        neewayImg &&
        neewayImg.width > 0 &&
        neewayImg.height > 0
    ) {

        const neewayAspect = neewayImg.width / neewayImg.height;
        const neewayWidth = targetHeight * neewayAspect;

        const neewayX = currentX - neewayWidth + 100;

        ctx.drawImage(neewayImg, neewayX, imgY + Math.sin(TimeManager.getTime() / 1000 + 450) * 10, neewayWidth, targetHeight);
        currentX = neewayX
    }


    ctx.textAlign = "left";

    ctx.fillStyle = "white";
    ctx.font = "72px Monospace";
    const title = "Five Nights With Rice";
    const titleWidth = ctx.measureText(title).width;
    const textX = canvas.width / 4 - titleWidth / 4;
    const textY = canvas.height / 4;
    ctx.fillText(title, textX, textY);


    // Start button
    ctx.font = "48px Monospace";
    const startText = "Night 1";
    const startX = textX + 5;
    const startY = textY + 180;
    const metrics = ctx.measureText(startText);
    const startWidth = metrics.width;
    const startHeight = 48;

    if (
        mouseX > startX &&
        mouseX < startX + startWidth &&
        mouseY > startY - startHeight &&
        mouseY < startY
    ) {
        if (lastHoverState.start === false) {
            playSound("hover");
        }
        ctx.fillStyle = "yellow";
        lastHoverState.start = true;
        if (mouseClicked) {
            stopAllSounds();
            playSound("click");
            StateManager.startGame(1);
        }
        
    } else {
        ctx.fillStyle = "white";
        lastHoverState.start = false;
    }
    ctx.fillText(startText, startX, startY);


    // Continue button
    var resumeText = "Continue (Night " + StateManager.getBestNight() + ")";

    const resumeX = textX + 5;
    const resumeY = textY + 240;
    const resumeWidth = ctx.measureText(resumeText).width;
    const resumeHeight = 48;

    if (
        mouseX > resumeX &&
        mouseX < resumeX + resumeWidth &&
        mouseY > resumeY - resumeHeight &&
        mouseY < resumeY
    ) {
        if (lastHoverState.resume === false) {
            playSound("hover");
        }
        ctx.fillStyle = "yellow";
        lastHoverState.resume = true;

        if (mouseClicked) {
            stopAllSounds();
            playSound("click");
            if (StateManager.getBestNight() > 4) {
                StateManager.startGame(4);
            } else {
                StateManager.startGame(StateManager.getBestNight());
            }
            
        }
    } else {
        ctx.fillStyle = "white";
        lastHoverState.resume = false;
    }

    ctx.fillText(resumeText, resumeX, resumeY);


    ctx.save();

    ctx.fillStyle = "yellow";
    ctx.font = String(32 + Math.sin(TimeManager.getTime() / 100) * 1) + "px Monospace";
    const infoText = "Night 4 is out!";
    const infoX = titleWidth + getRotatedTextWidth(ctx, infoText, -Math.PI / 12) / 2;
    const infoY = textY + 24;

    ctx.translate(infoX, infoY);

    ctx.rotate(-Math.PI / 12);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(infoText, 0, 0);

    ctx.restore();


    // Reset game
    ctx.textAlign = "center";
    ctx.font = "32px Monospace";
    const resetText = "Reset Save";
    const resetWidth = ctx.measureText(resetText).width;
    const resetX = textX + 5;
    const resetY = textY + 320;

    const resetHeight = 32;

    ctx.textAlign = "left";

    if (
        mouseX > resetX &&
        mouseX < resetX + resetWidth &&
        mouseY > resetY - resetHeight &&
        mouseY < resetY
    ) {
        if (lastHoverState.reset === false) {
            playSound("hover");
        }

        ctx.fillStyle = "red";
        lastHoverState.reset = true;

        if (mouseClicked) {
            playSound("click");

            localStorage.clear();
            window.location.reload();
        }
    } else {
        ctx.fillStyle = "white";
        lastHoverState.reset = false;
    }

    ctx.fillText(resetText, resetX, resetY);


    


    ctx.font = "24px monospace";
    ctx.fillStyle = "white";
    ctx.fillText("Version 1.4.0 - Created by class of 2028", 16, canvas.height - 32);

    renderSixTransition(canvas, ctx);
    renderStatic(canvas,ctx,updateSixty);
    renderStaticPassive(canvas, ctx, updateSixty);
    renderFade(canvas, ctx);

    /*if(mouseFirstMove){
        renderLight(canvas,ctx,mouseX,mouseY,updateSixty);
    }*/
}

function getRotatedTextWidth(ctx: CanvasRenderingContext2D, text: string, angle: number): number {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || parseInt(ctx.font);

    const rotatedWidth = Math.abs(textWidth * Math.cos(angle)) + Math.abs(fontHeight * Math.sin(angle));
    return rotatedWidth;
}