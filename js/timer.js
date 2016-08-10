if (!window.DG)window.DG = {};

DG.Timer = function (config) {

    this.renderTo = $(config.renderTo);
    if (config.showHours != undefined)this.showHours = config.showHours;
    if (config.countDownFrom != undefined)this.countDownFrom = config.countDownFrom;

    this.configure();

};

$.extend(DG.Timer.prototype, {

    lineSettings: {fill: "transparent", stroke: "#00FFFF", strokeWidth: 1},

    renderTo: undefined,
    svg: undefined,

    showHours: true,
    countDownFrom: undefined,

    updateInterval: 1000,

    startTime: undefined,
    elapsed: undefined,

    digits: {
        hour: undefined,
        minutes: [],
        seconds: [],
        colons: []
    },

    sizes: {
        canvas: undefined,
        digitArea: undefined,
        digits: undefined,
        spaceBetweenDigits: undefined,
    },

    digitOffset: undefined,

    configure: function () {

        this.measure();

        this.renderTo.svg({
            onLoad: function (svg) {
                console.log("Load");
                this.svg = svg;
                svg._svg.style.position = "absolute";
                var surface = svg.rect(0, 0, this.sizes.canvas.width, this.sizes.canvas.height, {
                    id: 'surface',
                    fill: 'transparent'
                });
                resetSize(svg, '100%', '100%');
                this.renderDigits();
                // this.debug();
            }.bind(this)
        });
    },

    measure: function () {
        this.sizes.canvas = {x: 0, y: 0, width: this.renderTo.width(), height: this.renderTo.height()};

        var relativeSize = 0.65;


        this.sizes.digitArea = {width: this.sizes.canvas.width * relativeSize, height: this.sizes.canvas.height * relativeSize};
        this.sizes.spaceBetweenDigits = this.sizes.digitArea.width / 50;

        this.sizes.colon = this.sizes.digitArea.width / 15;

        var remainingArea = this.sizes.digitArea.width - (this.showHours ? this.sizes.colon * 2 : this.sizes.colon);

        remainingArea -= this.sizes.spaceBetweenDigits * (this.showHours ? 6 : 4);

        var digitSize = this.showHours ? remainingArea / 5 : remainingArea / 4;

        this.sizes.digits = { width : digitSize, height : digitSize * 3};

        this.sizes.digitArea.height = this.sizes.digits.height;

        this.sizes.digitArea.x = (this.sizes.canvas.width - this.sizes.digitArea.width) / 2;
        this.sizes.digitArea.y = (this.sizes.canvas.height - this.sizes.digitArea.height) / 2;


        console.log(this.sizes);

    },

    debug: function () {
        this.debug(this.digitOffset.x, this.digitOffset.y,
            this.sizes.digitArea.width, this.sizes.digitArea.height);
    },

    renderDigits: function () {

        var x = this.sizes.digitArea.x;
        var y = this.sizes.digitArea.y;

        if (this.showHours) {

            this.debugRect(x, y, this.sizes.digits.width, this.sizes.digits.height);

            this.digits.hour = new DG.ClockDigit({
                svg: this.svg,
                bounds: { x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height }
            });

            x+= this.sizes.digits.width + this.sizes.spaceBetweenDigits;

            this.debugRect(x,y, this.sizes.colon, this.sizes.digits.height);

            x+= this.sizes.colon + this.sizes.spaceBetweenDigits;
        }

        this.digits.minutes.push(new DG.ClockDigit({
            svg: this.svg,
            bounds: { x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height }
        }));
        x+= this.sizes.digits.width + this.sizes.spaceBetweenDigits;
        this.digits.minutes.push(new DG.ClockDigit({
            svg: this.svg,
            bounds: { x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height }
        }));

        x+= this.sizes.digits.width + this.sizes.spaceBetweenDigits;
        this.debugRect(x,y, this.sizes.colon, this.sizes.digits.height);
        x+= this.sizes.colon + this.sizes.spaceBetweenDigits;

        this.digits.seconds.push(new DG.ClockDigit({
            svg: this.svg,
            bounds: { x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height }
        }));

        x+= this.sizes.digits.width + this.sizes.spaceBetweenDigits;
        this.digits.seconds.push(new DG.ClockDigit({
            svg: this.svg,
            bounds: { x: x, y: y, width: this.sizes.digits.width, height: this.sizes.digits.height }
        }));

    },

    debugRect: function (x, y, width, height) {
        this.svg.rect(x, y,
            width, height, this.lineSettings);
    },

    resetSize: function (svg, width, height) {
        svg.configure({
            width: width || $(svg._container).width(),
            height: height || $(svg._container).height()
        });
    },

    reset: function () {

    },

    start: function () {

    },


    update: function () {

    },

    onTimesUp: function () {

    },

    pause: function () {

    }


});

