/**
 * Created by alfmagne1 on 10/08/16.
 */

DG.ClockDigit = function(config){
    this.svg = config.svg;
    // { x, y, width, height }
    this.bounds = config.bounds;

    this.render();
};

$.extend(DG.ClockDigit.prototype, {

    svg:undefined,
    bounds:undefined,
    lineSettings: {fill: "transparent", stroke: "#669900", strokeWidth: 1},

    els:[],

    configure:function(){

    },

    showDigit:function(digit){

    },

    render:function(){
        this.debug();
    },

    debug:function(){
        this.svg.rect(this.bounds.x, this.bounds.y,
            this.bounds.width, this.bounds.height, this.lineSettings);
    }

});
