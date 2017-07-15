/*
 *     GAME REPRESENTATION
 * */

class Dom {

    // properties

    private static title: string = "serial <span>keno</span>";

    private static link: string = "https://www.facebook.com/allcrossword/";

    private static iconSource: string[] = ["files/assets/img/audio.png", ".png", "_off.png"];

    private static text: string[] = [
        "PAY TABLE",
        "Game Rules",
        "In Serial Keno you bet for how many consecutive numbers appear on the board after 20 numbers get selected randomly and without replacement from a total of 80 numbers.",
        "The game pays according to the longest sequence to show up. For example, if the longest run is  is a string of numbers from 2 to 10, the longest run is 9 and you get paid if the pay table has a corresponding payment. <br><br/>In addition, number 80 is linked to number 1. So numbers from 78 to 80 and from 1 to 5 make up a serie of 8 consecutive numbers.",
        "DO YOU LIKE THIS GAME? CLICK HERE TO CONTACT ME ON FACEBOOK"
    ];

    private static messages: string[] = ["Place a bet and/or press Play", "Game in progress", "Game Over", "You Won!"];

    private static buttonLabels: string[] = ["PLAY", "AUTO", "SPEED", "BET ONE", "BET MAX"];

    private static infoLabels: string[] = ["CREDITS", "BET", "COUNT", "PAY"];

    private static sounds: any[] = [
        new Audio("files/assets/media/click.wav"),
        new Audio("files/assets/media/blop.wav"),
        new Audio("files/assets/media/bonus.wav")
    ];

    public static objects: any[] = [];

    //functions

    private static drawBlocks(block: number, start: number, end: number, target: any, collection?: any): void {

        var elm: any[] = [];

        if(block === 0) {

            elm[0] = document.createElement("table");
            elm[0].className = "textcentered";
            target.appendChild(elm[0]);

            for(let i = start;i < end;i++) {
                if(i % 10 === 0) {
                    elm[1] = document.createElement("tr");
                    elm[0].appendChild(elm[1]);
                }
                elm[2] = document.createElement("td");
                elm[2].innerHTML = i + 1;
                elm[1].appendChild(elm[2]);
            }

        }
        else {

            for(let i = start;i < end;i++) {
                if(block === 1 || collection[i].val > 0) {
                    elm[0] = document.createElement("div");
                    target.appendChild(elm[0]);
                    elm[1] = document.createElement("span");
                    elm[1].innerHTML = block === 1 ? collection[i] : collection[i].label;
                    elm[0].appendChild(elm[1]);
                    elm[1] = document.createElement("label");
                    elm[1].className = "cl-right" + (block === 1 ? " info" : "");
                    elm[1].innerHTML =  block === 1 ? "" : collection[i].val;
                    elm[0].appendChild(elm[1]);
                }
            }

        }

    }

    public static bind(): void {

        var infoCollection: any[] = [Game.credits, Game.bet.current, Game.count, Game.pay], aux: string = "";

        this.objects["audio"].src = Game.audio ? this.iconSource[0] : this.iconSource[0].replace(this.iconSource[1], this.iconSource[2]);

        for(let i = 0, j = infoCollection.length;i < j;i++) {
            this.objects["info"][i].innerHTML = infoCollection[i];
            this.objects["info"][i].classList.toggle("mark", Game.pay > 0 && i > 1);
        }

        for(let i = 1, j = Game.numbers.set + 1;i < j;i++) {this.objects["cells"][i - 1].classList.toggle("selected", Game.numbers.selected.indexOf(i) >= 0);}

        for(let i = 0, j = this.objects["buttons"].length;i < j;i++) {
            if(i === 2) {
                for(let k = 0, l = Game.speed.vals.length;k < l;k++) {aux += (k > Game.speed.dial ? "<label>)</label>" : ")");}
                this.objects["buttons"][i].innerHTML = this.buttonLabels[i] + "&nbsp;<span>" + aux + "</span>";
                this.objects["buttons"][i].classList.toggle("disabled", Game.playing);
            }
            else {
                this.objects["buttons"][i].classList.toggle(
                    i === 1 ? "active" : "disabled",
                    i === 1 ? Game.auto : Game.betTopsCredits() || (i < 1 ? Game.playing || !Game.thereIsABet() : Game.playing || (Game.bet.session === 1 && Game.maxBetReached()))
                );
            }
        }

    }

    public static cyclicMessages() {
        this.objects["msg"].innerHTML = this.objects["msg"].innerHTML === "" ? this.messages[Game.messages] : "";
        this.objects["msg"].classList.toggle("mark", Game.messages === 3);
    }

    public static playSound(index: number, rate?: number): void {
        if(Game.audio) {
            if(rate !== undefined) {this.sounds[index].playbackRate = rate;}
            this.sounds[index].play();
        }
    }

    public static init(): void {

        var elm: any[] = [], buttons: string[] = ["PLAY", "AUTO", "SPEED", "BET ONE", "BET MAX"];

        elm[0] = document.createElement("div"); // main container
        elm[0].className = "container";
        document.body.appendChild(elm[0]);

        elm[1] = document.createElement("header"); // header
        elm[0].appendChild(elm[1]);

        elm[2] = document.createElement("h1"); // header title
        elm[2].innerHTML = this.title;
        elm[1].appendChild(elm[2]);

        elm[2] = document.createElement("menu"); // header menu
        elm[1].appendChild(elm[2]);

        for(let i = 0, j = buttons.length;i < j;i++) { // header menu buttons
            elm[3] = document.createElement("button");
            elm[3].className = "clickable";
            elm[3].innerHTML = this.buttonLabels[i];
            elm[2].appendChild(elm[3]);
        }

        elm[3] = document.createElement("img"); // header menu audio button
        elm[3].className = "cl-right icon clickable";
        elm[3].src = this.iconSource[0];
        elm[2].appendChild(elm[3]);

        elm[1] = document.createElement("section"); // content
        elm[0].appendChild(elm[1]);

        elm[2] = document.createElement("article"); // content grid, cyclic message and game rules title and first paragraph
        elm[2].className = "cl-left grid";
        elm[1].appendChild(elm[2]);

        this.drawBlocks(0, 0, Game.numbers.set / 2, elm[2]); // content grid board first section

        elm[3] = document.createElement("div"); // content grid cyclic messages
        elm[3].className = "msg textcentered";
        elm[2].appendChild(elm[3]);

        this.drawBlocks(0, 40, Game.numbers.set, elm[2]); // content grid board second section

        elm[3] = document.createElement("h2"); // content game rules title
        elm[3].innerHTML = this.text[1];
        elm[2].appendChild(elm[3]);

        elm[3] = document.createElement("p"); // content game rules first paragraph
        elm[3].innerHTML = this.text[2];
        elm[2].appendChild(elm[3]);

        elm[2] = document.createElement("article"); // content info and pay table
        elm[2].className = "cl-right";
        elm[1].appendChild(elm[2]);

        elm[3] = document.createElement("div"); // content info
        elm[3].className = "box";
        elm[2].appendChild(elm[3]);

        this.drawBlocks(1, 0, this.infoLabels.length, elm[3], this.infoLabels); // content info items

        elm[3] = document.createElement("div"); // content pay table
        elm[3].className = "box";
        elm[2].appendChild(elm[3]);

        elm[4] = document.createElement("p"); // content pay table header
        elm[4].innerHTML = this.text[0];
        elm[3].appendChild(elm[4]);

        this.drawBlocks(2, 0, Game.paytable.length, elm[3], Game.paytable); // content pay table items

        elm[2] = document.createElement("div"); // content column clearer
        elm[2].className = "cl-clear";
        elm[1].appendChild(elm[2]);

        elm[2] = document.createElement("p"); // content game rules rest of paragraphs
        elm[2].innerHTML = this.text[3];
        elm[1].appendChild(elm[2]);

        elm[1] = document.createElement("footer"); // footer
        elm[1].className = "textcentered";
        elm[0].appendChild(elm[1]);

        elm[2] = document.createElement("a"); // footer link
        elm[2].innerHTML = this.text[4];
        elm[2].href = this.link;
        elm[2].target = "_blank";
        elm[1].appendChild(elm[2]);

        this.objects["buttons"] = document.getElementsByTagName("BUTTON"); // buttons
        this.objects["audio"] = document.getElementsByTagName("IMG")[0]; // audio icon
        this.objects["cells"] = document.getElementsByTagName("TD"); // grid's cells
        this.objects["msg"] = document.getElementsByClassName("msg")[0]; // cyclic messages
        this.objects["info"] = document.getElementsByClassName("info"); // info panel

        this.bind();

    }

}