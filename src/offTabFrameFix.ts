
export class TimeManager {
    private static startTime = performance.now();
    private static pauseTotal = 0;
    private static pauseStart = 0;
    private static pausedAt = 0;
    private static focused = true;

    public static getFocused(): boolean {
        return this.focused;
    }

    public static getTime(): number {
        if (!this.focused) {
            return this.pausedAt;
        }

        return performance.now() - this.startTime - this.pauseTotal;
    }

    public static switchedOffTab() {
        if (!this.focused) return;
        this.focused = false;
        this.pauseStart = performance.now();
        this.pausedAt = this.pauseStart - this.startTime - this.pauseTotal;
        console.log("blur");
    }

    public static switchedToTab() {
        if (this.focused) return;
        this.focused = true;
        this.pauseTotal += performance.now() - this.pauseStart;
        this.pauseStart = 0;
        console.log(`time off of tab: ${this.pauseTotal}`);
    }
}