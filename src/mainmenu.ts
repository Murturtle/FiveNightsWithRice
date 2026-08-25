export { drawMainMenu };
import { State, StateManager } from "./gameState";
import { renderFade, renderStaticPassive, startFade, renderSixTransition, renderLight, renderStatic } from "./renderHelper";
import { playSound, stopAllSounds } from "./soundHelper";
import { TimeManager } from "./offTabFrameFix";
import { notes } from "./patchNotes";

var lastHoverState = { start: false, resume: false, reset: false, tut: false, github: false };

var audioBg: HTMLAudioElement | null = null;

const splashes = ["Night 4 is out!", "RIIIIICEEEEEE!!!", "Sherwood loves his diet coke", '"What is the sine of pi/6?" - Neeway', "Night 5 lowkey coming soon..."];
const rndSplash = Math.floor(Math.random() * splashes.length);

interface uData{
  revision: number;
  version: string;
  note: string;
}

var firstOpen = false;

var updateData: uData | null = null;

function drawMainMenu(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, updateSixty: boolean, mouseX: number, mouseY: number, mouseClicked: boolean, mouseFirstMove: boolean) {
    ctx.fillStyle = "rgb(80, 0, 129)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (audioBg == null) {
        audioBg = playSound("title");
        audioBg.loop = true;
        audioBg.volume = 0.33
    }

    if(!firstOpen) {
        firstOpen = true;
            fetch('https://example.com').then(function(response){
                if (!response.ok) {
                    updateData = {
                        "revision": 0,
                        "version": "0.0.0",
                        "note": "Failed to fetch update"
                    }
                }

                response.json().then(function(data: uData) {
                    updateData = data;
                });

                
            }).catch(function(){
                updateData = {
                    "revision": 0,
                    "version": "0.0.0",
                    "note": "Failed to fetch update"
                }
            })
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
    const infoText = splashes[rndSplash];
    const infoX = textX + titleWidth;
    const infoY = textY + 24;
    ctx.translate(infoX, infoY);
    ctx.rotate(-Math.PI / 12);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(infoText, 0, 0);
    ctx.restore();


    // Open tutorial
    ctx.font = "32px Monospace";
    const tutText = "Tutorial & Patch Notes";
    const tutWidth = ctx.measureText(tutText).width;
    const tutX = textX + 5;
    const tutY = textY + 290;
    const tutHeight = 32;

    ctx.textAlign = "left";

    if (
        mouseX > tutX &&
        mouseX < tutX + tutWidth &&
        mouseY > tutY - tutHeight &&
        mouseY < tutY
    ) {
        if (lastHoverState.tut === false) {
            playSound("hover");
        }

        ctx.fillStyle = "yellow";
        lastHoverState.tut = true;

        if (mouseClicked) {
            playSound("click");

            var wind = window.open("","","width=800,height=600");
            if(wind != null){
                wind.document.body.innerHTML = notes;
            }
            
        }
    } else {
        ctx.fillStyle = "white";
        lastHoverState.tut = false;
    }
    ctx.fillText(tutText, tutX, tutY);

    // Reset game
    ctx.font = "32px Monospace";
    const resetText = "Reset Save";
    const resetWidth = ctx.measureText(resetText).width;
    const resetX = textX + 5;
    const resetY = textY + 330;

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


    var credText = "Version 1.4.0 - Created by class of 2028 - "
    
    if(updateData == null) {
        credText += "Checking for updates..."
    } else if(updateData.version == "0.0.0") {
        credText += `${updateData.note}`;
    } else {
        credText = `Current: 1.4.0 - New Update Ready: ${updateData.version} - ${updateData.note}`;
    }
    ctx.font = "24px monospace";
    ctx.fillStyle = "white";
    ctx.fillText(credText, 16, canvas.height - 32);


    ctx.textAlign = "left";
    ctx.font = "24px Monospace";
    const githubText = "Github";
    var githubWidth = ctx.measureText(githubText).width;
    const githubX = canvas.width - githubWidth - 32;
    const githubHeight = 24;
    const githubY = canvas.height - 32;

    if (
        mouseX > githubX &&
        mouseX < githubX + githubWidth &&
        mouseY > githubY - githubHeight &&
        mouseY < githubY
    ) {
        if (lastHoverState.github === false) {
            playSound("hover");
        }
        ctx.fillStyle = "yellow";
        lastHoverState.github = true;

        if (mouseClicked) {
            playSound("click");

            window.open("https://github.com/Murturtle/FiveNightsWithRice");
        }
    } else {
        ctx.fillStyle = "white";
        lastHoverState.github = false;
    }

    ctx.fillText(githubText, githubX, githubY);


    renderSixTransition(canvas, ctx);
    renderStatic(canvas,ctx,updateSixty);
    renderStaticPassive(canvas, ctx, updateSixty);
    renderFade(canvas, ctx);

    /*if(mouseFirstMove){
        renderLight(canvas,ctx,mouseX,mouseY,updateSixty);
    }*/
}