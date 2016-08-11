/**
 * Created by alfmagne1 on 11/08/16.
 */

DG.ClockColon = function(config){
    this.svg = config.svg;
    // { x, y, width, height }
    this.bounds = config.bounds;

    this.render();
};


$.extend(DG.ClockColon.prototype, {

    svg:undefined,
    bounds:undefined,

    style: {fill: "#000", stroke: "#FFF", strokeWidth: 1},

    visible:undefined,

    render:function(){

        var centerX = this.bounds.x + (this.bounds.width / 2);
        var centerY = this.bounds.y + (this.bounds.height / 2);

        this.dot1 = this.svg.circle(centerX, centerY - (this.bounds.height / 5), this.bounds.width/2, this.style);
        this.dot2 = this.svg.circle(centerX, centerY + (this.bounds.height / 5), this.bounds.width/2, this.style);
    },

    toggle:function(){

        this.visible = !this.visible;

        this.dot1.setAttribute("visibility", this.visible ? "visible":"hidden");
        this.dot2.setAttribute("visibility", this.visible ? "visible":"hidden");

    }



});