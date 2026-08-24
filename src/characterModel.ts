import { StateManager } from "./gameState";
import { startStatic } from "./renderHelper";
import { playSound } from "./soundHelper";
import { TimeManager } from "./offTabFrameFix";

export { CharacterModel };

class CharacterModel {
    private location: number = 1;

    public setLocation(newLocation: number) {
        this.location = newLocation;
    }

    public getLocation(): number {
        return this.location;
    }

    private spawnLocation: number = 1;

    public setSpawnLocation(spawnLocation: number) {
        this.spawnLocation = spawnLocation;
    }

    public getSpawnLocation(): number {
        return this.spawnLocation;
    }

    private cooldown: number = 100;
    public lastMoveTime: number = 0;

    public getLastMoveTime(): number {
        return this.lastMoveTime;
    }

    public tryMove(): boolean {
        const now = TimeManager.getTime();
        if (now - this.lastMoveTime < this.cooldown) {
            return false;
        }
        if (StateManager.getCurrentView() != 0) {
            startStatic(1000);
            const staticSound = playSound("static");
            staticSound.volume = 0.3;
        }
        return true;
    }

    public setMoveNow(mv: number = TimeManager.getTime()) {
        this.lastMoveTime = mv;
    }

    public setCooldown(cooldown: number) {
        this.cooldown = cooldown;
    }

    private camPos: [number, number, number][] = [];

    public setCamPos(newCamPos: [number, number, number][]) {
        this.camPos = newCamPos;
    }

    public getCamPos(): [number, number, number][] {
        return this.camPos;
    }


    private images: HTMLImageElement[] = [];

    public getImages(): HTMLImageElement[] {
        return this.images;
    }

    public setImages(images: HTMLImageElement[]) {
        this.images = images;
    }

    private validNights: boolean[] = [];

    public setValidNights(nights: boolean[]) {
        this.validNights = nights;
    }

    public getValidNight(night: number): boolean {
        return this.validNights[night - 1];
    }

}