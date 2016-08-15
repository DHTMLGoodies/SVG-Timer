/**
DG-timer by DHTMLGoodies.com(Alf Magne Kalleland)
License: Apache
Compiled: 20160815125128
 */
if (!window.DG)window.DG = {};

DG.Timer = function (config) {

    this.renderTo = $(config.renderTo);
    if (config.showHours != undefined)this.showHours = config.showHours;
    if (config.decimalSeconds != undefined)this.decimalSeconds = Math.min(2, config.decimalSeconds); else this.decimalSeconds = 0;
    if (config.countDownFrom != undefined) {
        this.countDownFrom = config.countDownFrom;
        if (config.showWheel != undefined)this.showWheel = config.showWheel;
    }

    if(config.backgroundStyles != undefined)this.backgroundStyles = config.backgroundStyles;
    if(config.digitStyles != undefined)this.digitStyles = config.digitStyles;
    if(config.wheelStyles != undefined)this.wheelStyles = config.wheelStyles;
    if(config.colonStyles != undefined)this.colonStyles = config.colonStyles;
    if(config.listeners != undefined)this.listeners = config.listeners;
    if(config.updateInterval != undefined)this.updateInterval = config.updateInterval; else this.updateInterval=10;

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

    listeners:undefined,

    lastUpdateTime:undefined,

    updateInterval: undefined,

    configure: function () {

        this.sizes = {};
        this.measure();

        this.elapsed = 0;

        this.digits = {};
        this.digits.minutes = [];
        this.digits.seconds = [];
        this.digits.colons = [];
        this.digits.decimals = [];

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
        

        setInterval(this.update.bind(this), this.updateInterval);
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

        var spaces = this.showHours ? 6 : 4;
        if( this.decimalSeconds > 0)spaces += this.decimalSeconds;
        remainingArea -= this.sizes.spaceBetweenDigits * spaces;

        var decimalSize = 0;

        var digitSize;

        if(this.decimalSeconds > 0){
            var countDigits = this.showHours ? 5 : 4;
            this.sizes.spaceBeforeDecimals = this.sizes.spaceBetweenDigits / 1;
            remainingArea -= this.sizes.spaceBeforeDecimals;
            var decimalRelativeSize = 0.7;

            countDigits += decimalRelativeSize * this.decimalSeconds;

            digitSize = remainingArea / countDigits;
            decimalSize = digitSize * decimalRelativeSize;

            this.sizes.decimalDigits = {
                width : decimalSize,
                height: decimalSize * 3
            };

        }else{
            digitSize = this.showHours ? remainingArea / 5 : remainingArea / 4;
        }

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

        if(this.decimalSeconds > 0){
            x += this.sizes.digits.width + this.sizes.spaceBetweenDigits + this.sizes.spaceBeforeDecimals;
            y += this.sizes.digits.height - this.sizes.decimalDigits.height;

            for(var i=0;i<this.decimalSeconds; i++){


                this.digits.decimals.push(new DG.ClockDigit({
                    styles: this.digitStyles,
                    svg: this.svg,
                    bounds: {x: x, y: y, width: this.sizes.decimalDigits.width, height: this.sizes.decimalDigits.height}
                }));
                x += this.sizes.decimalDigits.width + this.sizes.spaceBetweenDigits;
            }



        }

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

            if(totalSeconds == 0 && this.lastUpdateTime != undefined && this.lastUpdateTime){
                this.onTimesUp();
            }

            this.lastUpdateTime = totalSeconds;
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


        if(this.decimalSeconds > 0){

            var dec1 = Math.floor(ms / 10) % 10;
            var dec2 = Math.floor(ms / 100) % 10;

            if(this.decimalSeconds > 1){
                this.digits.decimals[1].showDigit(dec1);
            }
            this.digits.decimals[0].showDigit(dec2);
        }
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
        this.lastUpdateTime = undefined;
        this.showTime(0);

        if(this.showWheel){
            this.wheel.update(this.countDownFrom * 1000, 0);
        }
    },

    onTimesUp: function () {
        if(this.listeners != undefined && this.listeners.onTimesUp != undefined){
            this.listeners.onTimesUp.call(this);
        }
    },

    pause: function () {
        this.active = false;
        this.showTime(this.getElapsed());
        this.elapsed = this.getElapsed();
    },

    add: function (seconds) {
        this.elapsed += (seconds * 1000);
        this.elapsed = Math.max(0, this.elapsed);
    },

    toggleStartPause: function(){
        if(this.active)this.pause(); else this.start();
    }
});

/**
 * Created by alfmagne1 on 10/08/16.
 */

DG.ClockDigit = function (config) {
    this.svg = config.svg;
    // { x, y, width, height }
    this.bounds = config.bounds;
    this.squareSize = this.bounds.width / 3;

    if(config.styles != undefined){
        this.digitStyle = config.styles;
    }else{
        this.digitStyle =  {fill: "#000"   };
    }

    if(this.digitStyle.strokeWidth == undefined)this.digitStyle.strokeWidth = 1;
    if(this.digitStyle.stroke == undefined)this.digitStyle.stroke = "#FFF";

    this.render();

    this.showDigit(0);
};

$.extend(DG.ClockDigit.prototype, {

    svg: undefined,
    bounds: undefined,

    digitStyle: undefined,
    squareSize: undefined,

    els: undefined,
    currentDigit:undefined,

    toggles:[
        [0,1,2,4,5,6],//0
        [2,5],// 1
        [0,2,3,4,6], //2
        [0,2,3,5,6], // 3
        [1,2,3,5], // 4
        [0,1,3,5,6], // 5
        [0,1,3,4,5,6], // 6
        [0,2,5], // 7
        [0,1,2,3,4,5,6], // 8
        [0,1,2,3,5,6] // 9
    ],

    render: function () {
        var height = 4;
        this.els = [];
        this.els.push({ visible:true, path: this.addPath({x: 0, y: 0}, {x: 2, y: 0}, "f02 f20 t20 t04 f44 f02" )}); // 0, top horizontal
        this.els.push({ visible:true, path: this.addPath({x: 0, y: 0}, {x: 0, y: height},  "f02 f44 t40 t12 t00" ) }); //1, top left
        this.els.push({ visible:true, path: this.addPath({x: 2, y: 0}, {x: 2, y: height}, "f04 f20 f42 t41 t32 t00") }); // 2, top right
        this.els.push({ visible:true, path: this.addPath({x: 0, y: height}, {x: 2, y: height}, "f12 f40 t00 t32 t04 f44")  }); // 3 center bar
        this.els.push({ visible:true, path: this.addPath({x: 0, y: height}, {x: 0, y: height * 2}, "f03 f12 f44 t40 t02")  }); // 4 bottom left
        this.els.push({ visible:true, path: this.addPath({x: 2, y: height}, {x: 2, y: height * 2}, "f04 f32 f43 t42 t24 t00" )}); // 5 bottom right
        this.els.push({ visible:true, path: this.addPath({x: 0, y: height*2}, {x: 2, y: height * 2}, "f02 f40 t00 t24 f24"  )}); // 6 bottom bar
    },

    pos:function(x,y, offsetX, offsetY){
        return [
            this.bounds.x + (this.squareSize * x) + (this.squareSize * offsetX / 4),
            this.bounds.y + (this.squareSize * y) + (this.squareSize * offsetY / 4)
        ]
    },

    showDigit: function (digit) {
        if(digit == this.currentDigit)return;
        var toggle = this.toggles[digit];

        for(var i=0;i<=6;i++){
            if(toggle.indexOf(i) >= 0)this.setVisible(i,true); else this.setVisible(i, false);
        }

        this.currentDigit = digit;
    },

    setVisible:function(index, visible){
        if(this.els[index].visible == visible)return;

        this.els[index].visible = !this.els[index].visible;
        this.els[index].path.setAttribute("visibility", this.els[index].visible ? "visible":"hidden");
    },


    addPath: function (from, to, definedPath) {
        var pathString = this.getDefinedPath(from, to, definedPath);

        return this.svg.path(pathString, this.digitStyle);
    },

    getDefinedPath:function(from, to, pathString){
        var path = [];
        var paths = pathString.split(/\s/g);
        for(var i=0;i<paths.length;i++){
            if(i == 0)path.push("M"); else path.push("L");

            var target = paths[i].substr(0,1);
            var offsetX = paths[i].substr(1,1) / 1;
            var offsetY = paths[i].substr(2,1) / 1;

            if(target == "f") {
                path.push(this.pos(from.x, from.y, offsetX, offsetY).join(" "));
            } else{
                path.push(this.pos(to.x, to.y, offsetX, offsetY).join(" "));
            }
        }
        path.push("Z");
        return path.join(" ");
    }
});
/**
 * Created by alfmagne1 on 11/08/16.
 */

DG.ClockColon = function(config){
    this.svg = config.svg;
    this.bounds = config.bounds;
    if(config.styles!= undefined)this.styles = config.styles;
    this.render();
};

$.extend(DG.ClockColon.prototype, {

    svg:undefined,
    bounds:undefined,
    styles:undefined,

    visible:undefined,

    render:function(){

        if(this.styles == undefined){
            this.styles = {};
        }
        if(this.styles.fill == undefined)this.styles.fill = "#000";
        if(this.styles.stroke == undefined)this.styles.stroke = "#FFF";
        if(this.styles.strokeWidth == undefined)this.styles.strokeWidth = 1;

        var centerX = this.bounds.x + (this.bounds.width / 2);
        var centerY = this.bounds.y + (this.bounds.height / 2);

        this.dot1 = this.svg.circle(centerX, centerY - (this.bounds.height / 5), this.bounds.width/2, this.styles);
        this.dot2 = this.svg.circle(centerX, centerY + (this.bounds.height / 5), this.bounds.width/2, this.styles);
    },

    toggle:function(){

        this.visible = !this.visible;

        this.dot1.setAttribute("visibility", this.visible ? "visible":"hidden");
        this.dot2.setAttribute("visibility", this.visible ? "visible":"hidden");

    }

});/**
 * Created by alfmagne1 on 11/08/16.
 */
DG.ClockWheel = function (config) {
    this.svg = config.svg;
    this.bounds = config.bounds;
    if (config.styles != undefined) {
        this.styles = config.styles;
    }

    this.render();
};

$.extend(DG.ClockWheel.prototype, {

    styles: undefined,
    radius: undefined,
    center: undefined,

    polarToCartesian: function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    describeArc: function (x, y, radius, startAngle, endAngle) {

        var fullCircle = Math.max(startAngle, endAngle) - Math.min(startAngle, endAngle) >= 360;

        if (fullCircle) {
            startAngle = 0;
            endAngle = 359;
        }

        var start = this.polarToCartesian(x, y, radius, endAngle);
        var end = this.polarToCartesian(x, y, radius, startAngle);

        var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

        if (Math.max(startAngle, endAngle) - Math.min(startAngle - endAngle) == 360) {
            arcSweep = "1";
        }
        var path = [
            "M", start.x, start.y,
            "A", radius, radius, 0, arcSweep, 0, end.x, end.y
        ];

        if (fullCircle) {
            path.push("Z");
        }
        return path.join(" ");

    },

    render: function () {
        this.els = {};


        if (this.styles.thickness == undefined)this.styles.thickness = this.bounds.width * 0.1;


        this.radius = {x: this.bounds.width / 2 -  (this.styles.thickness/2), y: this.bounds.height / 2 -  (this.styles.thickness/2)};
        this.center = {x: this.bounds.x + this.bounds.width / 2, y: this.bounds.y + this.bounds.height / 2};
        if (this.styles == undefined) this.styles = {};

        if (this.styles.background == undefined) {
            this.styles.background = {};
        }

        if (this.styles.background.stroke == undefined)this.styles.background.fill = "#CCC";
        if (this.styles.background.fill == undefined)this.styles.background.fill = "transparent";

        if (this.styles.wheel == undefined) {
            this.styles.wheel = {};
        }

        if (this.styles.wheel.fill == undefined)this.styles.wheel.fill = "transparent";
        if (this.styles.wheel.stroke == undefined)this.styles.wheel.stroke = "#669900";



        this.styles.background.strokeWidth = this.styles.thickness;
        this.styles.wheel.strokeWidth = this.styles.thickness;

        this.radius.x -= ( this.styles.background.strokeWidth / 2);
        this.radius.y -= ( this.styles.background.strokeWidth / 2);

        this.background = this.svg.circle(this.center.x, this.center.y, this.radius.x, this.styles.background);

        var path = this.describeArc(this.center.x, this.center.y, this.radius.x, 0, 360);
        this.wheel = this.svg.path(path, this.styles.wheel);

        this.renderBall();
    },

    renderBall:function(){
        if(this.styles.ball == undefined){
            this.styles.ball = {};
        }
        if(this.styles.ball.fill == undefined)this.styles.ball.fill = "#669900";
        var pos = this.getBallPos(0);
        this.ball = this.svg.circle(pos[0], pos[1], this.styles.thickness/1.2, this.styles.ball);
    },

    getBallPos:function(degrees){
        var angleInRadians = (degrees - 90) * Math.PI / 180.0;

        var x = this.center.x + (Math.cos(angleInRadians) * this.radius.x);
        var y = this.center.y + (Math.sin(angleInRadians) * this.radius.x);
        return [x,y];
    },

    update: function (total, elapsed) {
        if (elapsed > total)elapsed = total;
        var degrees = ((total - elapsed) / total) * 360;

        var path = this.describeArc(this.center.x, this.center.y, this.radius.x, 0, degrees);
        this.wheel.setAttribute("d", path);

        var ballPos = this.getBallPos(degrees);

        this.ball.setAttribute("cx", ballPos[0]);
        this.ball.setAttribute("cy", ballPos[1]);
    }

});