var Game = (function () {
    function Game() {
    }
    Game.random = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    Game.matches = function (series) {
        var counter = 0;
        for (var i = 0, j = series.length; i < j; i++) {
            if (series[i].length > counter) {
                counter = series[i].length;
            }
        }
        return counter;
    };
    Game.pickNumber = function () {
        var pick = 0;
        if (this.demo > 0) {
            this.numbers.selected.push(this.demo--);
        }
        else {
            while (pick === 0 || this.numbers.selected.indexOf(pick) >= 0) {
                pick = this.random(1, this.numbers.set);
            }
            this.numbers.selected.push(pick);
        }
    };
    Game.results = function () {
        var chain = this.numbers.selected, series = [], filter = [];
        chain.sort(function (a, b) { return a - b; });
        for (var i = 0, j = chain.length; i < j; ++i) {
            if (i === 0) {
                filter.push(chain[i]);
                continue;
            }
            if (chain[i - 1] !== (chain[i] - 1)) {
                series.push(filter);
                filter = [];
            }
            filter.push(chain[i]);
        }
        series.push(filter);
        if (this.lastAndFirstLinked()) {
            series.push(series[series.length - 1].concat(series[0]));
        }
        this.count = this.matches(series);
        this.pay = this.bet.current * this.paytable[this.count >= this.paytable.length ? this.paytable.length - 1 : this.count].val;
    };
    Game.manageBet = function () {
        if (this.bet.max > this.credits + this.bet.current) {
            this.bet.max = this.credits + this.bet.current;
        }
        else {
            this.bet.max = this.bet.def;
        }
        if (this.bet.session === 0) {
            this.bet.current = 0;
        }
    };
    Game.takeBet = function (amount) {
        this.credits -= this.bet.session === 0 ? amount : (amount > 1 ? (this.bet.max - this.bet.current) : 1);
        if (this.bet.session > 0) {
            this.bet.current = (amount > 1 ? amount : this.bet.current + 1);
        }
    };
    Game.takeWin = function (amount) {
        this.credits += amount;
        this.pay -= amount;
    };
    Game.canBetOne = function () { return this.bet.current < this.bet.max; };
    Game.canBetMax = function () { return this.bet.current < this.bet.max; };
    Game.maxBetReached = function () { return this.bet.current === this.bet.max; };
    Game.betTopsCredits = function () { return this.bet.current > this.credits && this.bet.session === 0; };
    Game.thereIsABet = function () { return this.bet.current > 0; };
    Game.lastAndFirstLinked = function () { return this.numbers.selected.indexOf(this.numbers.set) >= 0 && this.numbers.selected.indexOf(1) >= 0; };
    Game.paytable = [
        { "label": "Longest run is 0", "val": 0 },
        { "label": "Longest run is 1", "val": 0 },
        { "label": "Longest run is 2", "val": 0 },
        { "label": "Longest run is 3", "val": 0 },
        { "label": "Longest run is 4", "val": 2 },
        { "label": "Longest run is 5", "val": 5 },
        { "label": "Longest run is 6", "val": 25 },
        { "label": "Longest run is 7", "val": 100 },
        { "label": "Longest run is 8", "val": 500 },
        { "label": "Longest run is 9", "val": 1000 },
        { "label": "Longest run is 10", "val": 5000 },
        { "label": "Longer than 10", "val": 10000 }
    ];
    Game.pay = 0;
    Game.speed = { "vals": [350, 225, 100], "dial": 1 };
    Game.auto = false;
    Game.playing = false;
    Game.bet = { "def": 10, "max": 10, "current": 0, "session": 0 };
    Game.numbers = { "set": 80, "subset": 20, "selected": [] };
    Game.credits = 1000;
    Game.audio = true;
    Game.count = 0;
    Game.messages = 0;
    Game.draws = 0;
    Game.demo = 0;
    return Game;
}());
var Dom = (function () {
    function Dom() {
    }
    Dom.drawBlocks = function (block, start, end, target, collection) {
        var elm = [];
        if (block === 0) {
            elm[0] = document.createElement("table");
            elm[0].className = "textcentered";
            target.appendChild(elm[0]);
            for (var i = start; i < end; i++) {
                if (i % 10 === 0) {
                    elm[1] = document.createElement("tr");
                    elm[0].appendChild(elm[1]);
                }
                elm[2] = document.createElement("td");
                elm[2].innerHTML = i + 1;
                elm[1].appendChild(elm[2]);
            }
        }
        else {
            for (var i = start; i < end; i++) {
                if (block === 1 || collection[i].val > 0) {
                    elm[0] = document.createElement("div");
                    target.appendChild(elm[0]);
                    elm[1] = document.createElement("span");
                    elm[1].innerHTML = block === 1 ? collection[i] : collection[i].label;
                    elm[0].appendChild(elm[1]);
                    elm[1] = document.createElement("label");
                    elm[1].className = "cl-right" + (block === 1 ? " info" : "");
                    elm[1].innerHTML = block === 1 ? "" : collection[i].val;
                    elm[0].appendChild(elm[1]);
                }
            }
        }
    };
    Dom.bind = function () {
        var infoCollection = [Game.credits, Game.bet.current, Game.count, Game.pay], aux = "";
        this.objects["audio"].src = Game.audio ? this.iconSource[0] : this.iconSource[0].replace(this.iconSource[1], this.iconSource[2]);
        for (var i = 0, j = infoCollection.length; i < j; i++) {
            this.objects["info"][i].innerHTML = infoCollection[i];
            this.objects["info"][i].classList.toggle("mark", Game.pay > 0 && i > 1);
        }
        for (var i = 1, j = Game.numbers.set + 1; i < j; i++) {
            this.objects["cells"][i - 1].classList.toggle("selected", Game.numbers.selected.indexOf(i) >= 0);
        }
        for (var i = 0, j = this.objects["buttons"].length; i < j; i++) {
            if (i === 2) {
                for (var k = 0, l = Game.speed.vals.length; k < l; k++) {
                    aux += (k > Game.speed.dial ? "<label>)</label>" : ")");
                }
                this.objects["buttons"][i].innerHTML = this.buttonLabels[i] + "&nbsp;<span>" + aux + "</span>";
                this.objects["buttons"][i].classList.toggle("disabled", Game.playing);
            }
            else {
                this.objects["buttons"][i].classList.toggle(i === 1 ? "active" : "disabled", i === 1 ? Game.auto : Game.betTopsCredits() || (i < 1 ? Game.playing || !Game.thereIsABet() : Game.playing || (Game.bet.session === 1 && Game.maxBetReached())));
            }
        }
    };
    Dom.cyclicMessages = function () {
        this.objects["msg"].innerHTML = this.objects["msg"].innerHTML === "" ? this.messages[Game.messages] : "";
        this.objects["msg"].classList.toggle("mark", Game.messages === 3);
    };
    Dom.playSound = function (index, rate) {
        if (Game.audio) {
            if (rate !== undefined) {
                this.sounds[index].playbackRate = rate;
            }
            this.sounds[index].play();
        }
    };
    Dom.init = function () {
        var elm = [], buttons = ["PLAY", "AUTO", "SPEED", "BET ONE", "BET MAX"];
        elm[0] = document.createElement("div");
        elm[0].className = "container";
        document.body.appendChild(elm[0]);
        elm[1] = document.createElement("header");
        elm[0].appendChild(elm[1]);
        elm[2] = document.createElement("h1");
        elm[2].innerHTML = this.title;
        elm[1].appendChild(elm[2]);
        elm[2] = document.createElement("menu");
        elm[1].appendChild(elm[2]);
        for (var i = 0, j = buttons.length; i < j; i++) {
            elm[3] = document.createElement("button");
            elm[3].className = "clickable";
            elm[3].innerHTML = this.buttonLabels[i];
            elm[2].appendChild(elm[3]);
        }
        elm[3] = document.createElement("img");
        elm[3].className = "cl-right icon clickable";
        elm[3].src = this.iconSource[0];
        elm[2].appendChild(elm[3]);
        elm[1] = document.createElement("section");
        elm[0].appendChild(elm[1]);
        elm[2] = document.createElement("article");
        elm[2].className = "cl-left grid";
        elm[1].appendChild(elm[2]);
        this.drawBlocks(0, 0, Game.numbers.set / 2, elm[2]);
        elm[3] = document.createElement("div");
        elm[3].className = "msg textcentered";
        elm[2].appendChild(elm[3]);
        this.drawBlocks(0, 40, Game.numbers.set, elm[2]);
        elm[3] = document.createElement("h2");
        elm[3].innerHTML = this.text[1];
        elm[2].appendChild(elm[3]);
        elm[3] = document.createElement("p");
        elm[3].innerHTML = this.text[2];
        elm[2].appendChild(elm[3]);
        elm[2] = document.createElement("article");
        elm[2].className = "cl-right";
        elm[1].appendChild(elm[2]);
        elm[3] = document.createElement("div");
        elm[3].className = "box";
        elm[2].appendChild(elm[3]);
        this.drawBlocks(1, 0, this.infoLabels.length, elm[3], this.infoLabels);
        elm[3] = document.createElement("div");
        elm[3].className = "box";
        elm[2].appendChild(elm[3]);
        elm[4] = document.createElement("p");
        elm[4].innerHTML = this.text[0];
        elm[3].appendChild(elm[4]);
        this.drawBlocks(2, 0, Game.paytable.length, elm[3], Game.paytable);
        elm[2] = document.createElement("div");
        elm[2].className = "cl-clear";
        elm[1].appendChild(elm[2]);
        elm[2] = document.createElement("p");
        elm[2].innerHTML = this.text[3];
        elm[1].appendChild(elm[2]);
        elm[1] = document.createElement("footer");
        elm[1].className = "textcentered";
        elm[0].appendChild(elm[1]);
        elm[2] = document.createElement("a");
        elm[2].innerHTML = this.text[4];
        elm[2].href = this.link;
        elm[2].target = "_blank";
        elm[1].appendChild(elm[2]);
        this.objects["buttons"] = document.getElementsByTagName("BUTTON");
        this.objects["audio"] = document.getElementsByTagName("IMG")[0];
        this.objects["cells"] = document.getElementsByTagName("TD");
        this.objects["msg"] = document.getElementsByClassName("msg")[0];
        this.objects["info"] = document.getElementsByClassName("info");
        this.bind();
    };
    Dom.title = "serial <span>keno</span>";
    Dom.link = "https://www.facebook.com/allcrossword/";
    Dom.iconSource = ["files/assets/img/audio.png", ".png", "_off.png"];
    Dom.text = [
        "PAY TABLE",
        "Game Rules",
        "In Serial Keno you bet for how many consecutive numbers appear on the board after 20 numbers get selected randomly and without replacement from a total of 80 numbers.",
        "The game pays according to the longest sequence to show up. For example, if the longest run is  is a string of numbers from 2 to 10, the longest run is 9 and you get paid if the pay table has a corresponding payment. <br><br/>In addition, number 80 is linked to number 1. So numbers from 78 to 80 and from 1 to 5 make up a serie of 8 consecutive numbers.",
        "DO YOU LIKE THIS GAME? CLICK HERE TO CONTACT ME ON FACEBOOK"
    ];
    Dom.messages = ["Place a bet and/or press Play", "Game in progress", "Game Over", "You Won!"];
    Dom.buttonLabels = ["PLAY", "AUTO", "SPEED", "BET ONE", "BET MAX"];
    Dom.infoLabels = ["CREDITS", "BET", "COUNT", "PAY"];
    Dom.sounds = [
        new Audio("files/assets/media/click.wav"),
        new Audio("files/assets/media/blop.wav"),
        new Audio("files/assets/media/bonus.wav")
    ];
    Dom.objects = [];
    return Dom;
}());
var Main = (function () {
    function Main() {
    }
    Main.setVars = function (x) {
        var breakpoints = {
            "speed": {
                "points": [10, 30, 75],
                "vals": [100, 50, 25, 10]
            },
            "divisor": {
                "points": [25, 20, 15, 10, 5],
                "vals": [5000, 3000, 1000, 500]
            }
        }, speed = x < breakpoints.speed.points[0] ? breakpoints.speed.vals[0] : (x < breakpoints.speed.points[1] ? breakpoints.speed.vals[1] : (x < breakpoints.speed.points[2] ? breakpoints.speed.vals[2] : breakpoints.speed.vals[3])), divisor = 1, milestone = 100;
        if (x > milestone) {
            for (var i = breakpoints.divisor.points[0]; i > 1; i--) {
                if (x % i === 0) {
                    divisor = i;
                    if (x >= breakpoints.divisor.vals[0] ||
                        (i <= breakpoints.divisor.points[1] && x >= breakpoints.divisor.vals[1]) ||
                        (i <= breakpoints.divisor.points[2] && x >= breakpoints.divisor.vals[2]) ||
                        (i <= breakpoints.divisor.points[3] && x >= breakpoints.divisor.vals[3]) ||
                        i <= breakpoints.divisor.points[4]) {
                        break;
                    }
                }
            }
        }
        return [speed, divisor];
    };
    Main.gameReset = function () {
        Game.bet.session = 0;
        if (Game.auto && !Game.betTopsCredits()) {
            setTimeout(function () {
                Main.gameStart();
                Main.gameInProgress();
            }, 1000);
        }
        else {
            Game.playing = false;
            if (Game.auto) {
                Game.auto = false;
            }
            if (Game.betTopsCredits() && Game.credits > 0) {
                Game.bet.current = 0;
            }
        }
        Dom.bind();
    };
    Main.gameDone = function () {
        var vars = this.setVars(Game.pay);
        Game.messages = Game.pay > 0 ? 3 : 2;
        if (Game.pay > 0) {
            this.timer = setInterval(function () {
                if (Game.pay === 0) {
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
        else {
            this.gameReset();
        }
        Dom.bind();
    };
    Main.gameInProgress = function () {
        Game.messages = 1;
        Game.draws++;
        this.timer = setInterval(function () {
            if (Game.numbers.selected.length < Game.numbers.subset) {
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
    };
    Main.gameStart = function () {
        if (Game.bet.session === 0) {
            Game.takeBet(Game.bet.current);
        }
        Game.numbers.selected = [];
        Game.count = 0;
        Game.pay = 0;
    };
    Main.init = function () {
        Dom.init();
        var _loop_1 = function(i, j) {
            Dom.objects["buttons"][i].onclick = function () {
                var maxbet;
                if (i === 0) {
                    if (!Game.playing && !Game.betTopsCredits() && Game.thereIsABet()) {
                        Game.playing = true;
                        Main.gameStart();
                        Main.gameInProgress();
                    }
                }
                else if (i === 1) {
                    Game.auto = !Game.auto;
                }
                else if (i === 2) {
                    if (!Game.playing) {
                        Game.speed.dial = Game.speed.dial + 1 === Game.speed.vals.length ? 0 : Game.speed.dial + 1;
                    }
                }
                else {
                    maxbet = this.innerHTML.indexOf("MAX") >= 0;
                    Game.manageBet();
                    if (!Game.playing && ((maxbet && Game.canBetMax()) || (!maxbet && Game.canBetOne()))) {
                        Game.messages = 0;
                        Game.bet.session = 1;
                        Game.takeBet(maxbet ? Game.bet.max : 1);
                        Main.gameStart();
                    }
                }
                if (this.className.indexOf("disabled") < 0) {
                    Dom.bind();
                    Dom.playSound(0);
                }
            };
        };
        for (var i = 0, j = Dom.objects["buttons"].length; i < j; i++) {
            _loop_1(i, j);
        }
        Dom.objects["audio"].onclick = function () {
            Game.audio = !Game.audio;
            Dom.bind();
            Dom.playSound(0);
        };
        setInterval(function () { Dom.cyclicMessages(); }, 500);
    };
    Main.timer = null;
    return Main;
}());
Main.init();
