export { State };
import { CharacterModel } from "./characterModel";
import { startFade, startSixTransition, startStatic } from "./renderHelper";
import { playSound, stopAllSounds } from "./soundHelper";
import { TimeManager } from "./offTabFrameFix";

enum State {
    MainMenu,
    Playing,
    Launching
};

var camConnected = [
    [],
    [0, 2, 3],
    [1, 0, 4],
    [1, 6, 7],
    [5, 2, 6],
    [6, 4],
    [3, 7, 5],
    [3, 8],
    [7, 9],
    [8]
];

export class StateManager {
    private static currentState: State = State.Launching;
    private static characters: CharacterModel[] = []

    public static debug = false;

    static startGame(night: number) {
        this.setNight(night);
        this.setState(State.Playing);
        this.characters.forEach((character) => {
            character.setMoveNow();
        });
        startFade(5000);
        this.setGameTime();
        playSound("breathing");
        if (this.getNight() == 1) {
            setTimeout(function () { playSound("night1") }, 9000);
        }
        if (this.getNight() == 2) {
            setTimeout(function () { playSound("night2") }, 9000);
        }
        if(this.getNight() == 3) {
            setTimeout(function(){ playSound("night3") }, 9000);
        }
        if(this.getNight() == 4) {
            setTimeout(function(){ playSound("night4") }, 9000);
        }
    }

    static resetGame() {
        this.setState(State.MainMenu);
        this.setCurrentView(0);
        startFade(1000);
        this.characters.forEach((character) => {
            character.setLocation(character.getSpawnLocation());
        });
        this.setBatteryLevel(100);
        this.setCokeCount(6);
        this.doorState = false;
        stopAllSounds();

    }

    static loseNight() {
        this.resetGame();
        playSound("breathing");
    }

    static winNight() {
        if (this.getNight() < 5) {
            this.setNight(this.getNight() + 1);
            if (this.getNight() > this.getBestNight()) {
                this.setBestNight(this.getNight());
                localStorage.setItem("bestNight", String(this.getBestNight()));
            }
        }
        this.resetGame();
        startSixTransition();
    }


    static current(): State {
        return this.currentState;
    }

    static setState(newState: State) {
        this.currentState = newState;
    }

    private static night: number = 1;

    static getNight(): number {
        return this.night;
    }

    static setNight(night: number) {
        this.night = night;
    }

    private static gameStartTime = 0;

    static getGameStartTime(): number {
        return this.gameStartTime;
    }

    static setGameTime() {
        this.gameStartTime = TimeManager.getTime();
    }

    static getTimeHours(): number {
        const curTime = Math.floor((TimeManager.getTime() - this.gameStartTime) / 40000);
        if (curTime == 0) {
            return 12;
        } else {
            return curTime;
        }
    }

    private static bestNight: number = 1;

    static getBestNight(): number {
        return this.bestNight;
    }

    static setBestNight(night: number) {
        this.bestNight = night;
    }

    private static curView: number = 0;

    static getCurrentView(): number {
        return this.curView;
    }

    static setCurrentView(view: number, shouldPlaySound: boolean = false) {
        if (view != this.curView) {
            this.curView = view;
            startStatic(1000);
            if (shouldPlaySound) {
                playSound("click");
            }
        }
    }

    private static batteryLevel: number = 100;

    static getBatteryLevel(): number {
        return this.batteryLevel;
    }

    static setBatteryLevel(level: number) {
        this.batteryLevel = Math.max(0, Math.min(100, level));
    }

    static reduceBatteryLevel(amount: number) {
        this.setBatteryLevel(this.batteryLevel - amount);
    }

    static addDiddy(characterModel: CharacterModel) {
        this.characters.push(characterModel);
    }

    static getCharacters(): CharacterModel[] {
        return this.characters;
    }

    static tickCharacters() {
        this.characters.forEach((character, index) => {
            if (!character.getValidNight(this.getNight())) {
                return;
            }

            if (character.tryMove()) {
                character.setMoveNow();

                const connectedViews = camConnected[character.getLocation()];
                if (!connectedViews || connectedViews.length === 0) {
                    console.warn(`no cams for view ${character.getLocation()}`);
                    return;
                }

                let chosenView: number;

                if (connectedViews.length === 1) {
                    chosenView = connectedViews[0];
                } else {

                    const firstWeight = 0.75;
                    const r = Math.random();

                    if (r < firstWeight) {
                        chosenView = connectedViews[0];
                    } else {
                        const remainingCount = connectedViews.length - 1;

                        const normalized = (r - firstWeight) / (1 - firstWeight);

                        const index = Math.floor(normalized * remainingCount) + 1;
                        chosenView = connectedViews[index];
                    }
                }

                if (StateManager.isDoorClosed() && chosenView == 0 && index != 3) {
                    console.log("door closed");
                    playSound("banging");
                    setTimeout(function () { playSound("breathing"), 4000 });
                    if (Math.random() < 0.35) {
                        character.setLocation(1);
                    } else {
                        character.setLocation(character.getSpawnLocation());
                    }
                    return;
                } 
                
                if(index == 3 && chosenView == 0) {
                    this.setQuiz(true);
                }



                if (index == 2) {
                    chosenView = 0;
                }

                if (chosenView == 0 && index != 3) {
                    this.setCurrentView(0);
                    if (index == 0) {
                        playSound("rice");
                    } else if (index == 1) {
                        playSound("sherwood");
                    } else if (index == 2) {
                        const a = playSound("profit");
                        a.volume = 1.0;
                    } else if (index == 3) {
                        const a = playSound("neeway");
                    }

                    setTimeout(function () {
                        StateManager.loseNight();
                    }, 2500);
                }

                if (chosenView == 2 || chosenView == 3) {
                    playSound("bangcam");
                }
                console.log(
                    `Character moved from cam ${character.getLocation()} to ${chosenView}`
                );


                character.setLocation(chosenView);
            }
        });
    }

    static showQuiz: boolean = false

    static isQuizzing(): boolean {
        return this.showQuiz;
    }

    static setQuiz(val: boolean){
        this.showQuiz = val;
    }

    static doorState: boolean = false;

    static isDoorClosed(): boolean {
        return this.doorState;
    }

    static setDoorState(closed: boolean) {
        this.doorState = closed;

        if (this.current() == State.Playing) {
            if (closed) {
                playSound("doorclose");
            } else {
                playSound("dooropen");
            }
        }
    }

    private static cokeCount: number = 6;

    static setCokeCount(cokes: number) {
        this.cokeCount = cokes;
    }

    static decrCokeCount() {
        this.cokeCount -= 1;
        console.log("remove coke");
    }

    static getCokeCount(): number {
        return this.cokeCount;
    }

    static dropCoke(view: number) {
        if (this.cokeCount <= 0) return;


        const adjacent = camConnected[view];
        if (!adjacent || adjacent.length === 0) return;

        const character = StateManager.getCharacters()[1];

        if (adjacent.includes(character.getLocation())) {

            console.log(
                `Coke pulled character from ${character.getLocation()} to ${view}`
            );

            character.setLocation(view);

            character.setMoveNow();

            playSound("coke");
        }
    }
}
