/*
*     GAME FUNCTIONALITY
* */

class Main {

    public static timer: any = null;

    public static setVars(x: number): number[] {
        var breakpoints: {speed: {points: number[], vals: number[]}, divisor: {points: number[], vals: number[]}} = {
                "speed": {
                    "points": [10, 30, 75],
                    "vals": [100, 50, 25, 10]
                },
                "divisor": {
                    "points": [25, 20, 15, 10, 5],
                    "vals": [5000, 3000, 1000, 500]
                }
            },
            speed: number = x < breakpoints.speed.points[0] ? breakpoints.speed.vals[0] : (x < breakpoints.speed.points[1] ? breakpoints.speed.vals[1] : (x < breakpoints.speed.points[2] ? breakpoints.speed.vals[2] : breakpoints.speed.vals[3])),
            divisor: number = 1,
            milestone = 100;
        if(x > milestone) {
            for(let i = breakpoints.divisor.points[0];i > 1;i--) {
                if(x % i === 0) {
                    divisor = i;
                    if(x >= breakpoints.divisor.vals[0] ||
                        (i <= breakpoints.divisor.points[1] && x >= breakpoints.divisor.vals[1]) ||
                        (i <= breakpoints.divisor.points[2] && x >= breakpoints.divisor.vals[2]) ||
                        (i <= breakpoints.divisor.points[3] && x >= breakpoints.divisor.vals[3]) ||
                        i <= breakpoints.divisor.points[4]) {break;}
                }
            }
        }
        return [speed, divisor];
    }

    public static gameReset(): void {
        Game.bet.session = 0;
        if(Game.auto && !Game.betTopsCredits()) {
            setTimeout(function() {
                Main.gameStart();
                Main.gameInProgress();
            }, 1000);
        }
        else {
            Game.playing = false;
            if(Game.auto) {Game.auto = false;}
            if(Game.betTopsCredits() && Game.credits > 0) {Game.bet.current = 0;}
        }
        Dom.bind();
    }

    public static gameDone(): void {
        var vars: number[] = this.setVars(Game.pay);
        Game.messages = Game.pay > 0 ? 3 : 2;
        if(Game.pay > 0) {
            this.timer = setInterval(function() {
                if(Game.pay === 0) {
                    clearInterval(Main.timer);
                    Main.gameReset();
                }
                else {
                    Game.takeWin(vars[1]);
                    Dom.playSound(2);
                    Dom.bind();
                }
            }, vars[0]);
        }
        else {this.gameReset();}
        Dom.bind();
    }

    public static gameInProgress(): void {
        Game.messages = 1;
        Game.draws++;
        this.timer = setInterval(
            function() {
                if(Game.numbers.selected.length < Game.numbers.subset) {
                    Game.pickNumber();
                    Game.results();
                    Dom.playSound(1);
                    Dom.bind();
                }
                else {
                    clearInterval(Main.timer);
                    Main.gameDone();
                }
            }, Game.speed.vals[Game.speed.dial]);
    }

    public static gameStart(): void {
        if(Game.bet.session === 0) {Game.takeBet(Game.bet.current);}
        Game.numbers.selected = [];
        Game.count = 0;
        Game.pay = 0;
    }

    public static init() {

        Dom.init();

        for(let i = 0, j = Dom.objects["buttons"].length;i < j;i++) { // buttons functionality

            Dom.objects["buttons"][i].onclick = function() {

                var maxbet: boolean;

                if(i === 0) { // play button
                    if(!Game.playing && !Game.betTopsCredits() && Game.thereIsABet()) {
                        Game.playing = true;
                        Main.gameStart();
                        Main.gameInProgress();
                    }
                }

                else if (i === 1) {Game.auto = !Game.auto;} // auto button

                else if (i === 2) { // speed button
                    if(!Game.playing) {Game.speed.dial = Game.speed.dial + 1 === Game.speed.vals.length ? 0 : Game.speed.dial + 1;}
                }

                else { // bet buttons
                    maxbet = this.innerHTML.indexOf("MAX") >= 0;
                    Game.manageBet();
                    if(!Game.playing && ((maxbet && Game.canBetMax()) || (!maxbet && Game.canBetOne()))) {
                        Game.messages = 0;
                        Game.bet.session = 1;
                        Game.takeBet(maxbet ? Game.bet.max : 1);
                        Main.gameStart();
                    }
                }

                if(this.className.indexOf("disabled") < 0) {
                    Dom.bind();
                    Dom.playSound(0);
                }

            }

        }

        Dom.objects["audio"].onclick = function() {
            Game.audio = !Game.audio;
            Dom.bind();
            Dom.playSound(0);
        }

        setInterval(function() {Dom.cyclicMessages();}, 500);

    }

}

Main.init();