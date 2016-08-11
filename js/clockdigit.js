/**
 * Created by alfmagne1 on 10/08/16.
 */

DG.ClockDigit = function (config) {
    this.svg = config.svg;
    // { x, y, width, height }
    this.bounds = config.bounds;
    this.squareSize = this.bounds.width / 3;

    this.render();

    this.showDigit(0);
};

$.extend(DG.ClockDigit.prototype, {

    svg: undefined,
    bounds: undefined,

    digitStyle: {fill: "#000", stroke: "#FFF", strokeWidth: 1, "stroke-linecap": "round"},
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
        // this.debug();

        var height = 4;

        this.els = [];

        this.els.push({ visible:true, path: this.addPath({x: 0, y: 0}, {x: 2, y: 0},
        "f02 f20 t20 t04 f44 f02"
        )}); // 0, top horizontal
        this.els.push({ visible:true, path: 
            this.addPath({x: 0, y: 0}, {x: 0, y: height},
            "f02 f44 t40 t12 t00"
            )
        }); //1, top left

        this.els.push({ visible:true, path:
            this.addPath({x: 2, y: 0}, {x: 2, y: height},
            "f04 f20 f42 t41 t32 t00")

        }); // 2, top right

        this.els.push({ visible:true, path:
            this.addPath({x: 0, y: height}, {x: 2, y: height},
            "f12 f40 t00 t32 t04 f44")

        }); // 3 center bar

        this.els.push({ visible:true, path:
            this.addPath({x: 0, y: height}, {x: 0, y: height * 2},
            "f03 f12 f44 t40 t02")

        }); // 4 bottom left

        this.els.push({ visible:true, path:
            this.addPath({x: 2, y: height}, {x: 2, y: height * 2},
                "f04 f32 f43 t42 t24 t00"

            )}); // 5 bottom right

        this.els.push({ visible:true, path:
            this.addPath({x: 0, y: height*2}, {x: 2, y: height * 2},
            "f02 f40 t00 t24 f24"
            )}); // 6 bottom bar

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
        console.log(path.join(" "));

        return path.join(" ");
    },

    pos:function(x,y, offsetX, offsetY){
        return [
            this.bounds.x + (this.squareSize * x) + (this.squareSize * offsetX / 4),
            this.bounds.y + (this.squareSize * y) + (this.squareSize * offsetY / 4)
        ]
    },

    configure: function () {

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
        var pathString = this.getPathString(from, to, definedPath);

        return this.svg.path(pathString, this.digitStyle);
    },

    getPathString: function (from, to, definedPath) {

        return this.getDefinedPath(from, to, definedPath);
    }
});
