/**
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
    els: {
        background: undefined,
        el: undefined
    },

    polarToCartesian: function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    describeArc: function (x, y, radius, startAngle, endAngle) {

        var fullCircle = Math.max(startAngle, endAngle) - Math.min(startAngle , endAngle) >= 360;

        if(fullCircle){
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

        if(fullCircle){
            path.push("Z");
        }
        return path.join(" ");

    },

    render: function () {
        this.radius = {x: this.bounds.width / 2, y: this.bounds.height / 2};
        this.center = {x: this.bounds.x + this.bounds.width / 2, y: this.bounds.y + this.bounds.height / 2};
        if (this.styles == undefined) this.styles = {};

        if (this.styles.background == undefined) {
            this.styles.background = {};
        }

        if(this.styles.background.stroke == undefined)this.styles.background.fill = "#CCC";
        if(this.styles.background.fill == undefined)this.styles.background.fill = "transparent";

        if (this.styles.wheel == undefined) {
            this.styles.wheel = { };
        }

        if(this.styles.wheel.fill == undefined)this.styles.wheel.fill = "transparent";
        if(this.styles.wheel.stroke == undefined)this.styles.wheel.stroke = "#669900";

        if (this.styles.thickness == undefined)this.styles.thickness = 0.1;

        this.styles.background.strokeWidth = this.bounds.width * this.styles.thickness;
        this.styles.wheel.strokeWidth = this.bounds.width * this.styles.thickness;

        this.radius.x -= ( this.styles.background.strokeWidth / 2);
        this.radius.y -= ( this.styles.background.strokeWidth / 2);

        this.background = this.svg.circle(this.center.x, this.center.y, this.radius.x, this.styles.background);

        var path = this.describeArc(this.center.x, this.center.y, this.radius.x, 0, 360);
        this.wheel = this.svg.path(path, this.styles.wheel);
    },

    update: function (total, elapsed) {
        if (elapsed > total)elapsed = total;
        var degrees = ((total - elapsed) / total) * 360;
        var path = this.describeArc(this.center.x, this.center.y, this.radius.x, 0, degrees);
        this.wheel.setAttribute("d", path);
    }

});