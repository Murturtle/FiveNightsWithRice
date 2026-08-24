import { TimeManager } from "./offTabFrameFix";
import { renderFade, renderStatic, renderStaticPassive, startFade, startStatic } from "./renderHelper";
import { StateManager, State } from "./gameState";
import { playSound } from "./soundHelper";
import { AssetStore } from "./assetStore";

const tsLogo = new Image();
tsLogo.src = AssetStore.images["typescript"];
const wpLogo = new Image();
wpLogo.src = AssetStore.images["webpack"];

let lastState = 0;
let acceptSoundTime = 0;
let audioClick = false;
let dPressed = false;

export function renderLaunch(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    updateSixty: boolean,
    mouseClicked: boolean
) {
    ctx.fillStyle = "rgb(80, 0, 129)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (TimeManager.getTime() < 5000) {
        ctx.font = "24px Monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const lines = [
            "By playing this game you agree that you",
            "will never disclose who the creator(s) of the",
            "game are to any staff or other student."
        ];

        const lineHeight = 30;
        const startY =
            canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
            ctx.fillText(
                line,
                canvas.width / 2,
                startY + i * lineHeight
            );
        });

        if(dPressed == true) {
            StateManager.debug = true;
        }
    }

    if (TimeManager.getTime() >= 5000 && TimeManager.getTime() < 10000) {
        if (lastState == 0) {
            startStatic(500);
            lastState = 1;
        }

        ctx.font = "48px Monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText("Powered By:", canvas.width / 2, canvas.height / 3);

        const wpScaler = (canvas.height / wpLogo.height) * 0.10;
        const tsScaler = (canvas.height / tsLogo.height) * 0.15;

        const wpWidth = wpLogo.width * wpScaler;
        const tsWidth = tsLogo.width * tsScaler;

        ctx.drawImage(
            wpLogo,
            canvas.width / 2 - wpWidth,
            canvas.height / 2 - (wpLogo.height * wpScaler) / 2,
            wpWidth,
            wpLogo.height * wpScaler
        );

        ctx.drawImage(
            tsLogo,
            canvas.width / 2 + wpWidth / 4,
            canvas.height / 2 - (tsLogo.height * tsScaler) / 2 ,
            tsWidth,
            tsLogo.height * tsScaler
        );
    }


    if(TimeManager.getTime() >= 10000 && !audioClick) {

        if(lastState == 1) {
            startStatic(500);
            lastState = 2
        }

        if(mouseClicked) {
            audioClick = true;
        }



        if(TimeManager.getTime() > 10250) {
            ctx.font = "32px Monospace";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                    "Click anywhere to enable sound...",
                    canvas.width / 2,
                    canvas.height / 2.5,
                );

            ctx.fillText(
                    "Sound is STRONGLY recommended for gameplay",
                    canvas.width / 2,
                    canvas.height-canvas.height / 2.5,
                );

            ctx.font = "100px Monospace";
            ctx.fillText(
                    "🕪",
                    canvas.width / 2,
                    canvas.height / 2,
                );
        }
        
    }


    if(audioClick && TimeManager.getTime() > 5000 && lastState >= 2) {
        if(lastState == 2) {
            acceptSoundTime = TimeManager.getTime();
            startStatic(500);
            playSound("intro");
            lastState = 3
        }
        const newTime = TimeManager.getTime() - acceptSoundTime + 5000;
        
        if(newTime >= 5000 && newTime < 13000) {

            if(newTime > 5250) {
                ctx.font = "48px Monospace";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(
                        "Class of 2028 presents",
                        canvas.width / 2,
                        canvas.height / 3,
                    );

                if( newTime > 8500) {
                    ctx.fillStyle = "white";
                    ctx.font = "72px Monospace";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    const title = "Five Nights With Rice";
                    const textX = canvas.width / 2;
                    const textY = canvas.height / 2;
                    ctx.fillText(title, textX, textY);
                }
                
            }

            

        }

        if(newTime >= 13000) {
            StateManager.setState(State.MainMenu);
            startFade(2500);
        }
    }

    renderStatic(canvas,ctx,updateSixty);
    renderStaticPassive(canvas,ctx,updateSixty);
    renderFade(canvas,ctx);
}

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'd') {
        dPressed = true;
    }
});