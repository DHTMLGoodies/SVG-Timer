# SVG-Timer

###Simple SVG timer 

Example of Usage
```Javascript
<div id="timer" style="width:200px;height:200px"></div>

<script type="text/javascript">
    var timer;
    $(document).ready(function () {
        timer = new DG.Timer({
            countDownFrom : 5 * 60, // Count down from 5 minutes
            renderTo:"#timer", // Render to <div id="timer"
            showWheel:true, // Show count down wheel 
            digitStyles:{
                fill : "#42A5F5",   // Color of digits
                stroke : "#BBDEFB", // same color as background - used to create space
                strokeWidth : 1 // Stroke width = inline space between the lines of each digit
            },
            backgroundStyles:{ // Surface background
                "fill": "#BBDEFB"
            },
            wheelStyles:{ // SVG Styles of wheel (countdown)
                background: { stroke : "#0D47A1"}, // background of wheel
                wheel:{ stroke: "#42A5F5"} // Styles of running wheel
            },
            colonStyles:{ // Styles of colon
                fill: "#42A5F5",
                "stroke": "#BBDEFB", // Stroke can be used to make the colons smaller(same color as background)
                strokeWidth : 2 // Stroke width (not visible)
            }
        });
    });

</script>
<!-- Custom buttons -->
<input type="button" value="Pause" onclick="timer.pause()">
<input type="button" value="Start" onclick="timer.start()">
<input type="button" value="Reset" onclick="timer.reset()">


```