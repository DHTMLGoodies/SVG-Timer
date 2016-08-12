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

});