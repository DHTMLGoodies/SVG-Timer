<?php
/**
 * Created by IntelliJ IDEA.
 * User: alfmagne1
 * Date: 11/08/16
 * Time: 16:38
 */

error_reporting(E_ALL);
ini_set("display_errors", "on");
date_default_timezone_set("Europe/Berlin");

require_once("minify-master/src/Minify.php");
require_once("minify-master/src/JS.php");
use MatthiasMullie\Minify;


// Simple script compiling one JS file

$files = array(
    "timer", "clockdigit", "clockcolon", "clockwheel"

);

date_default_timezone_set("Europe/Berlin");

$fh = fopen("js/dg-timer.js", "w");

$header = "/**\nDG-timer by DHTMLGoodies.com(Alf Magne Kalleland)\nLicense: Apache\nCompiled: ". date("YmdHis") ."\n */\n";

fwrite($fh, $header, strlen($header));

foreach($files as $file){
    $content = file_get_contents("js/". $file. ".js");
    fwrite($fh, $content, strlen($content));
}

fclose($fh);

$minifier = new Minify\JS();
$minifier->add("js/timer.js");
$minifier->add("js/clockdigit.js");
$minifier->add("js/clockwheel.js");
$minifier->add("js/clockcolon.js");
$minifier->minify("js/timer-minified.js");


$content = file_get_contents("js/timer-minified.js");

$fh = fopen("js/timer-minified.js", "w");
$copyRightMessage = "/*\nSVG Timer By DHTMLGoodies.com - Alf Magne Kalleland\nLicense: http://www.apache.org/licenses/LICENSE-2.0\nBuild: " . date("YmdHis"). "\n*/";

fwrite($fh, $copyRightMessage, strlen($copyRightMessage));
fwrite($fh, $content, strlen($content));
fclose($fh);
