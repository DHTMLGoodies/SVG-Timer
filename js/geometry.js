/**
 * Created by alfmagne1 on 29/01/16.
 */


if (!window.DG) {
    window.DG = {};
}

DG.Geometry = function () {


};


$.extend(DG.Geometry.prototype, {

    getLineLength:function(line){
        var coordinates = this.getLineCoordinates(line);

        var x = Math.abs(coordinates.x1 - coordinates.x2);
        var y = Math.abs(coordinates.y1 - coordinates.y2);

        return Math.sqrt((x * x) + (y * y));

    },

    getLineIntersectionSVG: function (line1, line2) {
        var points1 = this.getLineCoordinates(line1);
        var points2 = this.getLineCoordinates(line2);

        return this.getLineIntersection(points1.x1, points1.y1, points1.x2, points1.y2, points2.x1, points2.y1, points2.x2, points2.y2);
    },

    getLineCoordinates: function (line) {
        return {
            x1: line.getAttribute("x1") / 1,
            y1: line.getAttribute("y1") / 1,
            x2: line.getAttribute("x2") / 1,
            y2: line.getAttribute("y2") / 1
        };
    },

    getLineIntersection: function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {

        // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
        var denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator == 0) {
            return result;
        }
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        result.x = line1StartX + (a * (line1EndX - line1StartX));
        result.y = line1StartY + (a * (line1EndY - line1StartY));
        /*
         // it is worth noting that this should be the same as:
         x = line2StartX + (b * (line2EndX - line2StartX));
         y = line2StartX + (b * (line2EndY - line2StartY));
         */
        // if line1 is a segment and line2 is infinite, they intersect if:
        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }
        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }
        // if line1 and line2 are segments, they intersect if both of the above are true
        return result;
    }

});

