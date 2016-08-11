if (!window.DG)window.DG = {};

DG.Timer = function (config) {

    this.renderTo = $(config.renderTo);
    if (config.showHours != undefined)this.showHours = config.showHours;
    if (config.countDownFrom != undefined) {
        this.countDownFrom = config.countDownFrom;
        if (config.showWheel != undefined)this.showWheel = config.showWheel;
    }

    if(config.backgroundStyles != undefined)this.backgroundStyles = config.backgroundStyles;
    if(config.digitStyles != undefined)this.digitStyles = config.digitStyles;
    if(config.wheelStyles != undefined)this.wheelStyles = config.wheelStyles;
    if(config.colonStyles != undefined)this.colonStyles = config.colonStyles;

    this.configure();
};

$.extend(DG.Timer.prototype, {

    renderTo: undefined,
    svg: undefined,

    showHours: true,
    countDownFrom: undefined,
    showWheel: false,
    updateInterval: 1000,

    digitStyles:undefined,
    colonStyles:undefined,

    active: undefined,

    startTime: undefined,
    elapsed: undefined,
    wheelStyles:undefined,

    digits:undefined,

    wheel: undefined,

    sizes: undefined,

    digitOffset: undefined,

    configure: function () {

        this.sizes = {};
        this.measure();

        this.elapsed = 0;

        this.digits = {};
        this.digits.minutes = [];
        this.digits.seconds = [];
        this.digits.colons = [];

        this.renderTo.svg({
            onLoad: function (svg) {
                this.svg = svg;
                svg._svg.style.position = "absolute";
                if(this.backgroundStyles == undefined){
                    this.backgroundStyles = {};
                }

                this.backgroundStyles.id = "surface";
                if(this.backgroundStyles.fill == undefined)this.backgroundStyles.fill = "transparent";

                var surface = svg.rect(0, 0, this.sizes.canvas.width, this.sizes.canvas.height, this.backgroundStyles);
                this.renderWheel();
                this.renderDigits();


                this.showTime(0);
                // this.debug();
            }.bind(this)
        });

        setInterval(this.update.bind(this), 100);
    },

    measure: function () {


        this.sizes.canvas = {x: 0, y: 0, width: this.renderTo.width(), height: this.renderTo.height()};

        if (this.showWheel) {
            this.sizes.canvas.width = this.sizes.canvas.height = Math.min(this.renderTo.width(), this.renderTo.height());
        }

        var relativeSize = this.showWheel ? 0.65 : 1;

        this.sizes.digitArea = {
            width: this.sizes.canvas.width * relativeSize,
            height: this.sizes.canvas.height * relativeSize
        };
        this.sizes.spaceBetweenDigits = this.sizes.digitArea.width / 50;

        this.sizes.colon = this.sizes.digitArea.width / 20;

        var remainingArea = this.sizes.digitArea.width - (this.showHours ? this.sizes.colon * 2 : this.sizes.colon);

        remainingArea -= this.sizes.spaceBetweenDigits * (this.showHours ? 6 : 4);

        var digitSize = this.showHours ? remainingArea / 5 : remainingArea / 4;

        this.sizes.digits = {width: digitSize, height: digitSize * 3};

        this.sizes.digitArea.height = this.sizes.digits.height;

        this.sizes.digitArea.x = (this.sizes.canvas.width - this.sizes.digitArea.width) / 2;
        this.sizes.digitArea.y = (this.sizes.canvas.height - this.sizes.digitArea.height) / 2;

    },

    debug: function () {
        this.debug(this.digitOffset.x, this.digitOffset.y,
            this.sizes.digitArea.width, this.sizes.digitArea.height);
    },

    renderWheel: function () {
        if (!this.showWheel)return;

        this.wheel = new DG.ClockWheel({
            svg: this.svg,
            bounds: this.sizes.canvas,
            styles : this.wheelStyles
        });

    },

    renderDigits: function () {

        var x = this.sizes.digitArea.x;
        var y = this.sizes.digitArea.y;

        if (this.showHours) {

            this.digits.hour = new DG.ClockDigit({
                styles: this.digitStyles,svg: this.svg,
                bounds: {x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height}
            });

            x += this.sizes.digits.width + this.sizes.spaceBetweenDigits;

            this.digits.colons.push(new DG.ClockColon({
                styles: this.colonStyles,svg: this.svg, bounds: {x: x, y: y, width: this.sizes.colon, height: this.sizes.digits.height}
            }));

            x += this.sizes.colon + this.sizes.spaceBetweenDigits;
        }

        this.digits.minutes.push(new DG.ClockDigit({
            styles: this.digitStyles,svg: this.svg,
            bounds: {x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height}
        }));
        x += this.sizes.digits.width + this.sizes.spaceBetweenDigits;
        this.digits.minutes.push(new DG.ClockDigit({
            styles: this.digitStyles,svg: this.svg,
            bounds: {x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height}
        }));

        x += this.sizes.digits.width + this.sizes.spaceBetweenDigits;

        this.digits.colons.push(new DG.ClockColon({
            styles: this.colonStyles,svg: this.svg, bounds: {x: x, y: y, width: this.sizes.colon, height: this.sizes.digits.height}
        }));

        x += this.sizes.colon + this.sizes.spaceBetweenDigits;

        this.digits.seconds.push(new DG.ClockDigit({
            styles: this.digitStyles,
            svg: this.svg,
            bounds: {x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height}
        }));

        x += this.sizes.digits.width + this.sizes.spaceBetweenDigits;
        this.digits.seconds.push(new DG.ClockDigit({
            styles: this.digitStyles,
            svg: this.svg,
            bounds: {x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height}
        }));

    },

    start: function () {
        if (this.elapsed == undefined)this.elapsed = 0;
        this.startTime = new Date().getTime();
        this.active = true;
    },

    showTime: function (ms) {

        var totalSeconds = Math.floor(ms / 1000);

        if (this.countDownFrom != undefined) {
            totalSeconds = Math.max(0, (this.countDownFrom) - totalSeconds);
        }

        var seconds = totalSeconds % 60;

        var sec2 = seconds % 10;
        var sec1 = (seconds - sec2) / 10;
        this.digits.seconds[0].showDigit(sec1 % 10);
        this.digits.seconds[1].showDigit(sec2 % 10);

        var minutes = Math.floor(totalSeconds / 60);

        var min2 = minutes % 10;
        var min1 = (minutes - min2) / 10;

        this.digits.minutes[0].showDigit(min1 % 10);
        this.digits.minutes[1].showDigit(min2 % 10);
    },

    update: function () {
        if (!this.active)return;
        var elapsed = this.getElapsed();
        this.showTime(elapsed);

        if(this.showWheel){
            this.wheel.update(this.countDownFrom * 1000, elapsed);
        }
    },

    getElapsed: function () {
        if (this.startTime == undefined)return 0;
        return this.elapsed + new Date().getTime() - this.startTime;
    },

    reset: function () {
        this.elapsed = 0;
        this.startTime = undefined;
        this.active = false;
        this.showTime(0);

        if(this.showWheel){
            this.wheel.update(this.countDownFrom * 1000, 0);
        }
    },

    onTimesUp: function () {

    },

    pause: function () {
        this.active = false;
        this.showTime(this.getElapsed());
        this.elapsed = this.getElapsed();
    },

    add: function (seconds) {
        this.elapsed += (seconds * 1000);
        this.elapsed = Math.max(0, this.elapsed);
    }
});

