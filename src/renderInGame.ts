import { renderStaticPassive, renderStatic } from "./renderHelper";
import { State, StateManager } from "./gameState";
import { playSound } from "./soundHelper";
import { renderFade } from "./renderHelper";
export { renderInGame }
import { TimeManager } from "./offTabFrameFix";
import { AssetStore } from "./assetStore";

const cbImg = new Image();
cbImg.src = AssetStore.images["chromebook"];

const camZero = new Image();
camZero.src = AssetStore.images["cam0"];

const camOne = new Image();
camOne.src = AssetStore.images["cam1"];

const camTwo = new Image();
camTwo.src = AssetStore.images["cam2"];

const camThree = new Image();
camThree.src = AssetStore.images["cam3"];

const camFour = new Image();
camFour.src = AssetStore.images["cam4"];

const camFive = new Image();
camFive.src = AssetStore.images["cam5"];

const camSix = new Image();
camSix.src = AssetStore.images["cam6"];

const camSeven = new Image();
camSeven.src = AssetStore.images["cam7"];

const camEight = new Image();
camEight.src = AssetStore.images["cam8"];

const camNine = new Image();
camNine.src = AssetStore.images["cam9"];

const camList = [camZero, camOne, camTwo, camThree, camFour, camFive, camSix, camSeven, camEight, camNine];

console.log(camList[0].width);

const camerasPos = [
    { name: "0", x: 0.535, y: 0.57 },
    { name: "1", x: 0.48, y: 0.576 },
    { name: "2", x: 0.4, y: 0.60 },
    { name: "3", x: 0.48, y: 0.41 },
    //{ name: "4", x: 0.35, y: 0.37 },
    { name: "4", x: 0.25, y: 0.59 },
    { name: "5", x: 0.274, y: 0.219 },
    { name: "6", x: 0.34, y: 0.37 },
    { name: "7", x: 0.626, y: 0.41 },
    { name: "8", x: 0.79, y: 0.37 },
    { name: "9", x: 0.8, y: 0.22 }
];

var audioBg: HTMLAudioElement | null = null;

function renderInGame(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    updateSixty: boolean,
    mouseX: number,
    mouseY: number,
    mouseClicked: boolean
) {



    if (audioBg == null) {
        audioBg = playSound("buzz");
        audioBg.loop = true;
    }

    let currentView = StateManager.getCurrentView();
    const isQuizzing = StateManager.isQuizzing();
    if (isQuizzing) {
        currentView = 0; // lock camera to cam0 while quizzing
    }
    const bgImg = camList[currentView];

    ctx.drawImage(
        bgImg,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const imgWidth = bgImg.width;
    const imgHeight = bgImg.height;

    StateManager.getCharacters().forEach((character) => {



        if (character.getLocation() !== currentView && !StateManager.debug) return;

        if (!character.getValidNight(StateManager.getNight()) && !StateManager.debug) {
            return;
        }

        

        

        const pos = character.getCamPos()[currentView];
        const imgChar = character.getImages()[currentView];

        if (!pos || !imgChar) return;

        const imageX = pos[0];
        const imageY = pos[1];
        var sizeFactor = pos[2];


        if (character.getLocation() == 0) {
            if(!StateManager.isQuizzing()) {
                sizeFactor *= Math.min(Math.ceil((TimeManager.getTime() - character.getLastMoveTime()) / 300), 10);
            }
        }

        const scaleX = canvas.width / imgWidth;
        const scaleY = canvas.height / imgHeight;

        const screenX = imageX * scaleX;
        const screenY = imageY * scaleY;

        const baseSize = imgHeight * sizeFactor;

        const drawWidth = sizeFactor * imgHeight * scaleX;
        const drawHeight = baseSize * scaleY;

        ctx.save();
        ctx.translate(screenX, screenY + drawHeight / 2);
        ctx.rotate(
            TimeManager.getTime() % 10000 < 150
                ? 0.5
                : 0
        );
        
        if (currentView == 0) {
            ctx.drawImage(
                imgChar,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
        } else {
            ctx.drawImage(
                imgChar,
                -drawWidth / 2,
                -drawHeight,
                drawWidth,
                drawHeight
            );
        }

        ctx.restore();

        if (StateManager.debug) {
            ctx.save()

            ctx.strokeStyle =
                character.getLocation() !== StateManager.getCurrentView()
                    ? "red"
                    : "lime";

            ctx.lineWidth = 2;

            const boxX = screenX - drawWidth / 2;
            const boxY = currentView === 0
                ? screenY
                : screenY - drawHeight / 2;

            ctx.strokeRect(
                boxX,
                boxY,
                drawWidth,
                drawHeight
            );
            ctx.restore()
        }
    });

    renderStatic(canvas, ctx, updateSixty);

    if (isQuizzing) {
        const overlayAlpha = 0.75;
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const boxW = Math.min(canvas.width * 0.32, 420);
        const boxH = Math.min(canvas.height * 0.12, 90);
        const gapX = Math.max(16, boxW * 0.08);
        const gapY = Math.max(12, boxH * 0.4);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 20;

        const totalWidth = boxW * 2 + gapX;
        const totalHeight = boxH * 2 + gapY;

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = Math.floor(boxH * 0.5) + "px Monospace";
        const questionY = centerY - totalHeight / 2 - boxH * 0.3;
        ctx.fillText("What is sin(π/6)?", centerX, questionY);

        const choices = ["1/2", "sqrt(3/2)", "1", "0"];

        const boxes: { x: number; y: number; w: number; h: number }[] = [];

        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = centerX - totalWidth / 2 + col * (boxW + gapX);
            const y = centerY - totalHeight / 2 + row * (boxH + gapY);
            boxes.push({ x, y, w: boxW, h: boxH });
        }

        ctx.textBaseline = "middle";
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            // box background
            ctx.lineWidth = 4;
            ctx.strokeStyle = "white";
            ctx.fillStyle = "black";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeRect(b.x, b.y, b.w, b.h);

            ctx.fillStyle = "white";
            ctx.font = Math.floor(boxH * 0.5) + "px Monospace";
            ctx.fillText(choices[i], b.x + b.w / 2, b.y + b.h / 2);
        }

        if (mouseClicked) {
            for (let i = 0; i < boxes.length; i++) {
                const b = boxes[i];
                const isHovering =
                    mouseX >= b.x &&
                    mouseX <= b.x + b.w &&
                    mouseY >= b.y &&
                    mouseY <= b.y + b.h;
                if (isHovering) {
                    const chosen = choices[i];
                    if (chosen === "1/2") {
                        playSound("click");
                        StateManager.setQuiz(false);
                        StateManager.getCharacters()[3].setLocation(StateManager.getCharacters()[3].getSpawnLocation());
                    } else {
                        StateManager.setQuiz(false);
                        StateManager.getCharacters()[3].lastMoveTime = TimeManager.getTime();
                        setTimeout(function(){StateManager.loseNight()},2500);
                    }
                }
            }
        }

        renderFade(canvas, ctx);
        if (StateManager.getCurrentView() === 0) {
            renderStaticPassive(canvas, ctx, updateSixty, false);
        } else {
            renderStaticPassive(canvas, ctx, updateSixty);
        }
        return;
    }

    if (mouseClicked) {

        const imageX = (mouseX / canvas.width) * imgWidth;
        const imageY = (mouseY / canvas.height) * imgHeight;

        console.log(
            "Original Image Pixel:",
            Math.round(imageX),
            Math.round(imageY)
        );
    }


    var cbScale = canvas.width / cbImg.width * 0.4;

    var tX = canvas.width - cbImg.width * cbScale;
    var tY =
        canvas.height * 0.75 -
        (cbImg.height * cbScale) / 2 +
        Math.sin(TimeManager.getTime() / 1000) * 5;

    tX = 0;

    ctx.drawImage(
        cbImg,
        tX,
        tY,
        cbImg.width * cbScale,
        cbImg.height * cbScale
    );

    const fontSize = cbImg.height * cbScale * 0.05;

    if (StateManager.getBatteryLevel() <= 5) {
        ctx.fillStyle = "red";
    } else if (StateManager.getBatteryLevel() <= 20) {
        ctx.fillStyle = "yellow";
    } else {
        ctx.fillStyle = "lime";
    }



    ctx.font = fontSize + "px Monospace";
    ctx.strokeStyle = "black";

    ctx.textAlign = "right";

    const batteryText = Math.round(StateManager.getBatteryLevel()) + "%";

    ctx.fillText(
        batteryText,
        tX + cbImg.width * cbScale * 0.89,
        tY + cbImg.height * cbScale * 0.67
    );

    ctx.strokeText(
        batteryText,
        tX + cbImg.width * cbScale * 0.89,
        tY + cbImg.height * cbScale * 0.67
    );

    ctx.textAlign = "start";

    if (StateManager.getCurrentView() !== 0) {
        ctx.fillStyle = "lime";
        ctx.fillText(
            "< Ur here",
            tX + cbImg.width * cbScale * 0.57,
            tY + cbImg.height * cbScale * 0.58
        );

        ctx.strokeText(
            "< Ur here",
            tX + cbImg.width * cbScale * 0.57,
            tY + cbImg.height * cbScale * 0.58
        );
    }

    // Door Button
    if (StateManager.getCurrentView() == 0) {
        const doorText = StateManager.isDoorClosed() ? "Open Door" : "Close Door";

        ctx.font = "32px Monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textMetrics = ctx.measureText(doorText);
        const padding = 16;

        const buttonWidth = textMetrics.width + padding * 2;
        const buttonHeight = 50;

        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height - 90;

        const isHoveringDoor =
            mouseX >= buttonX &&
            mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY &&
            mouseY <= buttonY + buttonHeight;

        ctx.lineWidth = 3;
        if (isHoveringDoor) {
            ctx.strokeStyle = "lime";
            ctx.fillStyle = "lime";
        } else if (!StateManager.isDoorClosed()) {
            ctx.strokeStyle = "white";
            ctx.fillStyle = "white";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "red";
        }
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.fillText(
            doorText,
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeText(
            doorText,
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );

        // Click 
        if (isHoveringDoor && mouseClicked && !(StateManager.getBatteryLevel() <= 0)) {
            StateManager.setDoorState(!StateManager.isDoorClosed());
            playSound("click");
        }
    }

    // Coke button when sherwood is in the game
    if (StateManager.getCurrentView() != 0 && StateManager.getCharacters()[1].getValidNight(StateManager.getNight())) {
        const doorText = "DIET COKE (" + StateManager.getCokeCount() + ")";

        ctx.font = "32px Monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textMetrics = ctx.measureText(doorText);
        const padding = 16;

        const buttonWidth = textMetrics.width + padding * 2;
        const buttonHeight = 50;

        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height - 90;

        const isHoveringCoke =
            mouseX >= buttonX &&
            mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY &&
            mouseY <= buttonY + buttonHeight;

        // Button box
        ctx.lineWidth = 3;
        if (isHoveringCoke) {
            ctx.strokeStyle = "lime";
            ctx.fillStyle = "lime";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "red";
        }

        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Text
        ctx.fillText(
            doorText,
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeText(
            doorText,
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );

        // Click 
        if (isHoveringCoke && mouseClicked && StateManager.getCokeCount() > 0) {
            playSound("coke");
            StateManager.decrCokeCount();
            StateManager.dropCoke(StateManager.getCurrentView());
        }
    }

    // Show orange button on cam 8
    if (StateManager.getCurrentView() == 8 && StateManager.getCharacters()[2].getValidNight(StateManager.getNight())) {
        const doorText = "ORANGE";

        ctx.font = "32px Monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textMetrics = ctx.measureText(doorText);
        const padding = 16;

        const buttonWidth = textMetrics.width + padding * 2;
        const buttonHeight = 50;

        const buttonX = canvas.width - buttonWidth - 90;
        const buttonY = canvas.height - 90;

        const isHoveringOrange =
            mouseX >= buttonX &&
            mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY &&
            mouseY <= buttonY + buttonHeight;

        // Button box
        ctx.lineWidth = 3;
        if (isHoveringOrange) {
            ctx.strokeStyle = "lime";
            ctx.fillStyle = "lime";
        } else {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "orange";
        }

        if (TimeManager.getTime() - StateManager.getCharacters()[2].getLastMoveTime() < 38000) {
            ctx.strokeStyle = "gray";
            ctx.fillStyle = "gray";
        }

        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Text
        ctx.fillText(
            doorText,
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeText(
            doorText,
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );

        // Click 
        if (isHoveringOrange && mouseClicked && TimeManager.getTime() - StateManager.getCharacters()[2].getLastMoveTime() > 38000) {
            const a = playSound("profit");
            a.volume = 0.5;
            StateManager.getCharacters()[2].setMoveNow();
        }
    }


    // Render cams on chromebook
    camerasPos.forEach((cam) => {

        const x = tX + cbImg.width * cbScale * cam.x;
        const y = tY + cbImg.height * cbScale * cam.y;

        const isActive =
            cam.name === currentView.toString();

        ctx.font = fontSize + "px Monospace";
        const metrics = ctx.measureText(cam.name);

        const padding = fontSize * 0.2;
        const squareSize =
            Math.max(metrics.width, fontSize) + padding;

        const squareX = x - squareSize / 2;
        const squareY = y - squareSize / 2;

        ctx.lineWidth = 2;
        ctx.strokeStyle = isActive ? "lime" : "yellow";

        if (StateManager.getBatteryLevel() <= 0 && cam.name != "0") {
            ctx.strokeStyle = "red";
        }

        if (TimeManager.getTime() - StateManager.getCharacters()[2].getLastMoveTime() > 40000 && cam.name == "8" && StateManager.getCharacters()[2].getValidNight(StateManager.getNight())) {
            if (Math.sin(TimeManager.getTime() / 100) > 0) {
                ctx.strokeStyle = "red";
            }
        }
        ctx.strokeRect(squareX, squareY, squareSize, squareSize);

        ctx.fillStyle = isActive ? "lime" : "yellow";


        if (StateManager.getBatteryLevel() <= 0 && cam.name != "0") {
            ctx.fillStyle = "red";
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(cam.name === "0" ? "X" : cam.name, x, y);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeText(cam.name === "0" ? "X" : cam.name, x, y);

        const isHovering =
            mouseX >= squareX &&
            mouseX <= squareX + squareSize &&
            mouseY >= squareY &&
            mouseY <= squareY + squareSize;

        if (isHovering && mouseClicked && StateManager.getBatteryLevel() > 0) {
            StateManager.setCurrentView(parseInt(cam.name), true);
        }
    });

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "white";
    ctx.font = "36px Monospace";
    ctx.fillText("Night " + StateManager.getNight(), 20, 40);
    ctx.fillText(StateManager.getTimeHours() + " AM", 20, 76);

    renderFade(canvas, ctx);

    if (StateManager.getCurrentView() === 0) {
        renderStaticPassive(canvas, ctx, updateSixty, false);
    } else {
        renderStaticPassive(canvas, ctx, updateSixty);
    }
}


