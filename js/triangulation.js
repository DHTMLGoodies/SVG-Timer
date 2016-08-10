if (!window.DG)window.DG = {};

DG.Triangulation = function (config) {

    this.image = config.image;
    this.els.source = $(config.source);
    this.els.canvas = $(config.canvas);
    this.els.textFrame = $(config.textFrame);


    this.configure();

};


$.extend(DG.Triangulation.prototype, {

    image: undefined,

    originalSize: undefined,

    countPictures:13,

    started: false,

    sketchpad: undefined,
    referencePad: undefined,

    tip:[
        "Shift+Click on a circle to remove it",
        "Alt+Click on a circle to remove a line going from it",
        "Think of the angle between two points as the second hand of a watch. This may help you see the angle.",
        "Try to figure out which angles you measure best(south west, north east etc.) and try to start with these",
        "The closer the angle is to 90 degrees, the more accurate you will be measuring the intersection.",
        "Click on a dot on the right picture to draw line from it. After two lines has been created a new dot will be added at the intersection."

    ],

    /**
     * @var DG.Geometry geometry
     */
    geometry: undefined,

    circleSettings: {fill: "transparent", stroke: "#FF0000", strokeWidth: 2},
    circleSettingsUser: {fill: "transparent", stroke: "#00FF00", strokeWidth: 2},
    lineSettings: {fill: "transparent", stroke: "#00FFFF", strokeWidth: 1},

    els: {
        picture1: undefined,
        picture2: undefined,
        source: undefined,
        canvas: undefined,
        startButton: undefined
    },

    svg: {},

    referencePoints: [],

    inLineMode: false,

    configure: function () {

        this.geometry = new DG.Geometry();

        this.setNewPicture();

        this.addEvents();
        this.resizeDivs();
        this.addPictures();
        this.addSVG();

        this.onNewPicture();

        this.onResize();

        this.setOriginalSize();

        this.updateTip();
    },

    onNewPicture: function () {
        this.started = false;
        this.clearAllSVG();
        this.setImageSources();
        this.updateHeading();
    },

    setOriginalSize: function () {
        this.originalSize = {
            x: this.els.canvas.width(),
            y: this.els.canvas.height()
        };
    },

    resizeDivs: function () {
        var height = $(document.documentElement).height();

        var top = this.els.source.position().top;
        height -= top;

        this.els.source.height(height);
        this.els.canvas.height(height);
    },

    addEvents: function () {
        $(window).resize(this.onResize.bind(this));
    },

    onResize: function () {
        this.resizeDivs();
        this.resizeImages();
        this.resizeSVGContainers();

        this.repositionSVGElements();
    },

    resizeSVGContainers: function () {
        var canvasSize = this.getCanvasSize();

        this.resizeSVGContainer(this.referencePad, canvasSize);
        this.resizeSVGContainer(this.sketchpad, canvasSize);
    },

    resizeSVGContainer: function (container, size) {
        container._svg.style.height = size.y + "px";
        container._svg.style.width = size.x + "px";

        $(container.root()).attr("viewBox", "0 0 " + size.x + " " + size.y);

        this.resetSize(container, size.x, size.y);

    },

    resetSize: function (svg, width, height) {
        svg.configure({
            width: width || $(svg._container).width(),
            height: height || $(svg._container).height()
        });
    },

    repositionSVGElements: function () {

    },

    getCanvasSize: function () {
        return {
            x: this.els.canvas.width(),
            y: this.els.canvas.height()
        };
    },

    addPictures: function () {
        this.els.picture1 = $("<img>");
        this.els.picture1.css("position", "absolute");
        this.els.picture1.bind('load', this.resizeImages.bind(this));
        this.els.source.append(this.els.picture1);

        this.els.picture2 = $("<img>");
        this.els.picture2.css("position", "absolute");
        this.els.picture2.bind('load', this.resizeImages.bind(this));
        this.els.canvas.append(this.els.picture2);
    },

    setImageSources: function () {
        this.els.picture1.attr("src", this.image);
        this.els.picture2.attr("src", this.image);
    },

    resizeImages: function () {
        var size = {x: this.els.picture1.width(), y: this.els.picture1.height()};
        var ratio = size.x / size.y;

        if (size.x * ratio > this.els.source.width()) {
            this.els.picture1.width(this.els.source.width());
            this.els.picture2.width(this.els.source.width());
            this.els.picture1.height("auto");
            this.els.picture2.height("auto");
        } else {
            this.els.picture1.height(this.els.source.height());
            this.els.picture2.height(this.els.source.height());

            this.els.picture1.width("auto");
            this.els.picture2.width("auto");

        }

    },


    addSVG: function () {
        this.els.canvas.svg({
            onLoad: function (svg) {
                this.sketchpad = svg;
                svg._svg.style.position = "absolute";
                var surface = svg.rect(0, 0, '100%', '100%', {id: 'surface', fill: 'transparent'});

                this.els.canvas.on("mousedown", this.startDrag.bind(this));
                this.els.canvas.on("mousemove", this.dragging.bind(this));
                this.els.canvas.on("mouseup", this.endDrag.bind(this));
                resetSize(svg, '100%', '100%');
            }.bind(this)
        });
        this.els.source.svg({
            onLoad: function (svg) {
                this.referencePad = svg;
                svg._svg.style.position = "absolute";
                var surface = svg.rect(0, 0, '100%', '100%', {id: 'surface', fill: 'transparent'});
                this.els.source.on("mousedown", this.addPointInReference.bind(this));
                resetSize(svg, '100%', '100%');
            }.bind(this)
        });
    },

    addPointInReference: function (event) {

        if (this.started)return;

        var pos = this.getClickPos(event);

        var indexToChange = this.getIndexOfReferencePointToChange(pos);

        if (indexToChange >= 0) {
            this.referencePad.remove(this.svg.referencePoints[indexToChange]);
            this.sketchpad.remove(this.svg.referencePointsInSketchPad[indexToChange]);

            this.svg.referencePoints.splice(indexToChange, 1);
            this.svg.referencePointsInSketchPad.splice(indexToChange, 1);

            // this.referencePad.change(this.svg.referencePoints[indexToChange], { cx: pos.x, cy: pos.y });
            // this.sketchpad.change(this.svg.referencePointsInSketchPad[indexToChange], { cx: pos.x, cy: pos.y });

        } else {
            this.addReferenceCircles(pos);
        }

        this.updateHeading();
    },

    addReferenceCircles: function (pos) {
        this.svg.referencePoints.push(this.referencePad.circle(pos.x, pos.y, 5, this.circleSettings));
        this.svg.referencePointsInSketchPad.push(this.sketchpad.circle(pos.x, pos.y, 5, this.circleSettings));
    },

    getClickPos: function (event, inSketchPad) {
        var pos = {x: event.clientX, y: event.clientY};

        pos.y -= this.els.canvas.position().top;

        if (inSketchPad)pos.x -= this.els.canvas.position().left;

        return pos;
    },

    getIndexOfReferencePointToChange: function (clickPos) {
        var offset = this.getCanvasSize().x / 20;
        var closestIndex = -1;
        var maxDistance = 10000;

        for (var i = 0; i < this.svg.referencePoints.length; i++) {
            var pos = this.getCirclePoint(this.svg.referencePoints[i]);
            var distance = this.distanceBetween(clickPos, pos);
            if (distance < maxDistance) {
                maxDistance = distance;
                closestIndex = i;
            }
            if (distance < offset) {
                return i;
            }
        }

        if (this.svg.referencePoints.length == 2) {
            return closestIndex;
        }

        return -1;


    },

    getCirclePoint: function (circle) {
        return {
            x: circle.getAttribute("cx") / 1, y: circle.getAttribute("cy") / 1
        };
    },

    getCircleRadius: function (circle) {
        return circle.getAttribute("r") / 1;
    },

    distanceBetween: function (point1, point2) {

        var x = Math.abs(point1.x - point2.x);
        var y = Math.abs(point1.y - point2.y);

        return Math.sqrt((x * x) + (y * y));
    },

    startDrag: function (event) {

        if (!this.started)return;

        if (this.currentLine != undefined) {
            this.finalizeLine();
        } else {
            var pos = this.getClickPos(event, true);
            var shift = event.shiftKey;
            var altKey = event.altKey;

            var circle = this.getUserCircleAtPos(pos);
            if (circle) {

                if (shift) {
                    this.removeUserPoint(circle);
                } else if (altKey) {
                    this.removeLinesStartingFromCircle(circle);


                } else {
                    var lines = this.getUserLinesFromCircle(circle);
                    if (lines.length == 0) {
                        var circlePos = this.getCirclePoint(circle);
                        this.createLine(circlePos, pos);
                    }
                }
                return;
            }

            circle = this.getRefererenceCircleAtPos(pos);
            if (circle && !shift) {

                if (altKey) {
                    this.removeLinesStartingFromCircle(circle);
                } else {
                    circlePos = this.getCirclePoint(circle);


                    this.createLine(circlePos, pos);

                }


                return;
            }


            // this.addUserCircle(pos);

        }
    },


    removeLinesStartingFromCircle: function (circle) {
        var lines = this.getUserLinesFromCircle(circle);

        for (var i = 0; i < lines.length; i++) {
            this.sketchpad.remove(lines[i]);
            this.svg.userLines.splice(this.svg.userLines.indexOf(lines[i]), 1);
        }

    },

    getUserLinesFromCircle: function (circle) {
        var pos = this.getCirclePoint(circle);
        var ret = [];
        for (var i = 0; i < this.svg.userLines.length; i++) {
            var line = this.svg.userLines[i];

            if (this.lineStartsAtPoint(line, pos)) {
                ret.push(line);
            }

        }

        return ret;

    },

    lineStartsAtPoint: function (line, pos) {
        var lineStart = {x: line.getAttribute("x1"), y: line.getAttribute("y1")};
        return lineStart.x == pos.x && lineStart.y == pos.y;
    },

    addUserCircle: function (pos) {
        var circle = this.sketchpad.circle(pos.x, pos.y, 5, this.circleSettingsUser);
        this.svg.userPoints.push(circle);
    },

    finalizeLine: function () {

        var length = this.geometry.getLineLength(this.currentLine);

        if(length < this.els.canvas.width() / 8)return;

        this.svg.userLines.push(this.currentLine);
        this.currentLine = undefined;

        if (this.svg.userLines.length == 2) {
            var intersection = this.geometry.getLineIntersectionSVG(this.svg.userLines[0], this.svg.userLines[1]);

            if (this.isWithinCanvas(intersection)) {
                this.addUserCircle(intersection);
            }


            this.removeAllUserLines();
        }
    },

    isWithinCanvas: function (point) {

        return point.x >= 0 && point.y >= 0 && point.x <= this.els.canvas.width() && point.y <= this.els.canvas.height();
    },


    removeAllUserLines: function () {

        for (var i = 0; i < this.svg.userLines.length; i++) {
            this.sketchpad.remove(this.svg.userLines[i]);
        }

        this.svg.userLines = [];

    },

    createLine: function (from, to) {
        // line: function(parent, x1, y1, x2, y2, settings)
        this.currentLine = this.sketchpad.line(from.x, from.y, to.x, to.y, this.lineSettings);
    },

    moveLine: function (pos) {
        this.sketchpad.change(this.currentLine, {x2: pos.x, y2: pos.y});

    },

    removeUserPoint: function (circle) {
        var pos = this.svg.userPoints.indexOf(circle);
        if (pos >= 0) {
            this.sketchpad.remove(circle);
            this.svg.userPoints.splice(pos, 1);
        }
    },

    getUserCircleAtPos: function (pos) {
        return this.getCircleAtPosInArray(pos, this.svg.userPoints);
    },

    getRefererenceCircleAtPos: function (pos) {
        return this.getCircleAtPosInArray(pos, this.svg.referencePointsInSketchPad);
    },

    getCircleAtPosInArray: function (pos, array) {
        for (var i = 0; i < array.length; i++) {
            var circle = array[i];
            var rect = this.circleToRectangle(circle);
            if (pos.x >= rect.left && pos.y >= rect.top && pos.x <= rect.right && pos.y <= rect.bottom) {
                return circle;
            }
        }

    },

    circleToRectangle: function (circle) {
        var pos = this.getCirclePoint(circle);
        var radius = this.getCircleRadius(circle);
        return {left: pos.x - radius, top: pos.y - radius, right: pos.x + radius, bottom: pos.y + radius};
    },

    dragging: function (event) {

        if (this.currentLine != undefined) {
            var pos = this.getClickPos(event, true);
            this.moveLine(pos);
        }
    },

    endDrag: function () {

    },

    updateHeading: function () {
        this.els.textFrame.empty();
        if (this.svg.referencePoints.length == 0) {
            this.setHeadingText("Click to add 2 reference points to the left picture");
            this.addNewPictureButton();
        } else if (this.svg.referencePoints.length == 1) {
            this.setHeadingText("Click to add last reference point or click on existing point to remove it.");
            this.addNewPictureButton();
        } else if (!this.started) {
            this.els.startButton = $("<button>START</button>");
            this.els.startButton.addClass("triangulation-button");
            this.els.textFrame.append(this.els.startButton);
            this.els.startButton.on("click", this.start.bind(this));
            this.addNewPictureButton();

        } else {
            this.els.startButton = $("<button>Toggle Picture</button>");
            this.els.startButton.addClass("triangulation-button");
            this.els.textFrame.append(this.els.startButton);
            this.els.startButton.on("click", this.togglePicture.bind(this));

            this.els.startOverButton = $("<button>Start Over</button>");
            this.els.startOverButton.addClass("triangulation-button");
            this.els.textFrame.append(this.els.startOverButton);
            this.els.startOverButton.on("click", this.startOver.bind(this));

            this.addNewPictureButton();

            this.els.tip = $("<p class='triangulation-label'>Click on a dot on the right picture to draw line from it. After two lines has been created a new dot will be added at the intersection.</p>");
            this.els.textFrame.append(this.els.tip);
        }
    },

    updateTip:function(){
        if(this.started && this.svg.userPoints.length > 0){
            var index = Math.floor(Math.random() * this.tip.length);
            this.showTip(this.tip[index]);
        }

        setTimeout(this.updateTip.bind(this), 10000);
    },

    showTip:function(text){
        if(this.els.tip != undefined){
            this.els.tip.html("Tip: " + text);
        }
    },

    addNewPictureButton:function(){
        var newPictureButton = $("<button>New Picture</button>");
        newPictureButton.addClass("triangulation-button");
        this.els.textFrame.append(newPictureButton);
        newPictureButton.on("click", this.newPicture.bind(this));
    },

    setNewPicture:function(){
        var picture = Math.floor(Math.random() * this.countPictures) + 1;
        this.image = "images/picture" + picture + ".png";
    },

    newPicture:function(){
        this.els.picture2.show();

        this.setNewPicture();
        this.onNewPicture();
    },

    togglePicture: function () {
        this.els.picture2.toggle();
    },

    start: function () {
        this.els.picture2.hide();
        this.started = true;
        this.updateHeading();
    },

    setHeadingText: function (text) {
        this.els.textFrame.text(text);
    },


    getReferencePoints: function () {
        var ret = [];
        for (var i = 0; i < this.svg.referencePoints.length; i++) {
            ret.push(this.getCirclePoint(this.svg.referencePoints[i]));
        }
        return ret;
    },

    startOver: function () {

        var references = this.getReferencePoints();

        this.clearAllSVG();
        this.started = false;

        this.els.picture2.hide();

        for (var i = 0; i < references.length; i++) {
            this.addReferenceCircles(references[i]);
        }

        this.started = true;

        this.updateHeading();
    },

    clearAllSVG: function () {

        this.svg = {
            referencePoints: [],
            referencePointsInSketchPad: [],

            userPoints: [],
            userLines: [],

            currentLine: undefined
        };

        this.sketchpad.clear();
        this.referencePad.clear();


    }

});
