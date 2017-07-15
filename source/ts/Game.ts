/*
 *     GAME LOGIC
 * */

class Game {

    // properties

    public static paytable: {label: string, val: number}[] = [
        {"label": "Longest run is 0", "val": 0},
        {"label": "Longest run is 1", "val": 0},
        {"label": "Longest run is 2", "val": 0},
        {"label": "Longest run is 3", "val": 0},
        {"label": "Longest run is 4", "val": 2},
        {"label": "Longest run is 5", "val": 5},
        {"label": "Longest run is 6", "val": 25},
        {"label": "Longest run is 7", "val": 100},
        {"label": "Longest run is 8", "val": 500},
        {"label": "Longest run is 9", "val": 1000},
        {"label": "Longest run is 10", "val": 5000},
        {"label": "Longer than 10", "val": 10000}
    ];

    public static pay: number = 0;

    public static speed: {vals: number[], dial: number} = {"vals": [350, 225, 100], "dial": 1};

    public static auto: boolean = false;

    public static playing: boolean = false;

    public static bet: {def: number, max: number, current: number, session: number} = {"def": 10, "max": 10, "current": 0, "session": 0};

    public static numbers: {set: number, subset: number, selected: number[]} = {"set": 80, "subset": 20, "selected": []};

    public static credits: number = 100;

    public static audio: boolean = true;

    public static count: number = 0;

    public static messages: number = 0;

    public static draws: number = 0;

    public static demo: number[] = [];

    // functions

    private static random(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static matches(series: number[][]): number {
        var counter: number = 0;
        for(let i = 0, j = series.length;i < j;i++) {
            if(series[i].length > counter) {counter = series[i].length;}
        }
        return counter;
    }

    public static pickNumber(): void {
        var pick: number = 0;
        if(this.demo.length > 0) {
            this.numbers.selected.push(this.demo[0]);
            this.demo.shift();
        }
        else {
            while(pick === 0 || this.numbers.selected.indexOf(pick) >= 0) {pick = this.random(1, this.numbers.set);}
            this.numbers.selected.push(pick);
        }
    }

    public static results(): void {
        var chain: number[] = this.numbers.selected, series: number[][] = [], filter: number[] = [];
        chain.sort(function (a, b) {return a - b;});
        for(let i = 0, j = chain.length; i < j; ++i) {
            if(i === 0) {
                filter.push(chain[i]);
                continue;
            }
            if(chain[i - 1] !== (chain[i] - 1)) {
                series.push(filter);
                filter = [];
            }
            filter.push(chain[i]);
        }
        series.push(filter);
        if(this.lastAndFirstLinked()) {series.push(series[series.length - 1].concat(series[0]));}
        this.count = this.matches(series);
        this.pay = this.bet.current * this.paytable[this.count].val;
    }

    public static manageBet(): void {
        if(this.bet.max > this.credits + this.bet.current) {this.bet.max = this.credits + this.bet.current;}
        else {this.bet.max = this.bet.def;}
        if(this.bet.session === 0) {this.bet.current = 0;}
    }

    public static takeBet(amount: number): void {
        this.credits -= this.bet.session === 0 ? amount : (amount > 1 ? (this.bet.max - this.bet.current) : 1);
        if(this.bet.session > 0) {this.bet.current = (amount > 1 ? amount : this.bet.current + 1);}
    }

    public static takeWin(amount): void {
        this.credits += amount;
        this.pay -= amount;
    }

    public static canBetOne(): boolean {return this.bet.current < this.bet.max;}

    public static canBetMax(): boolean {return this.bet.current < this.bet.max;}

    public static maxBetReached(): boolean {return this.bet.current === this.bet.max;}

    public static betTopsCredits(): boolean {return this.bet.current > this.credits && this.bet.session === 0;}

    public static thereIsABet(): boolean {return this.bet.current > 0;}

    public static lastAndFirstLinked(): boolean {return this.numbers.selected.indexOf(this.numbers.set) >= 0 && this.numbers.selected.indexOf(1) >= 0;}

}