var system = require('system');
var args = system.args;
var settings = {
    url: args[1],
    output_dir: (args[2] != undefined ? args[2] : "screenshots"),
    zoom: (args[3] != undefined ? args[3] : 1),
    height: (args[4] != undefined ? args[4] : 1200),
    width: (args[5] != undefined ? args[5] : 1920),
    delayInMillis: 2000

};

var fs = require('fs');
settings.output_file = "./" + settings.output_dir + "/output_" + getTimestamp() + ".png";

settings.outputLog = fs.open(settings.output_file + ".css", 'w');

function getTimestamp() {
    //var dateTime = require('./date.format.js');
    var _now = new Date();
    var _return = "00000"; //_now.format(dateFormat.masks.timestamp)
    return (_return);
}


(function (callSettings) {
    var settings = callSettings;

    console.log(JSON.stringify(settings));


    page = require('webpage').create();
    page.callSettings = settings;
    page.viewportSize = {
        width: settings.width,
        height: settings.height
    };

    page.zoomFactor = settings.zoom;


    page.onConsoleMessage = function (msg) {
        return console.log(msg);
    };

    page.onResourceReceived = function (response) {
        if (response.url === settings.url) {
            console.log('Resorce: "' + response.url + '" status: ' + response.status);

            if (response.status === 200) {
                console.log(response.url);
                for (var i = 0; i < response.headers.length; i++) {
                    console.log(response.headers[i].name + ': ' + response.headers[i].value);
                }
            }
        }
    };

    //if page does a call back do some processing
    page.onCallback = function(data) {
        console.log('CALLBACK: ' + JSON.stringify(data));

        if (data.selector=="#dsq-2") {
            processAfterLoad();
        }
    };

    //when page is loaded start testin for a component
    page.onLoadFinished = function (status) {

        waitForElementToDisplay("#dsq-2", settings.delayInMillis);

    };

    //this is process to take a screenshot
    function processAfterLoad() {

        var height = page.evaluate(function(){
            return $('body')[0].offsetHeight;
        });
        var width = page.evaluate(function(){
            return $('body')[0].offsetWidth;
        });
        console.log('Crop to: '+width+"x"+height);

        page.clipRect = { top: 0, left: 0, width: width, height: height };

        var result = doWork();

        console.log("Page process: " + result);
        phantom.exit();
    };

    //wait loop
    function waitForElementToDisplay(selector, time) {
        console.log("Waiting:");
        console.log(JSON.stringify([selector, time]));

        var status = page.evaluate(function(selector) {
            var componentLoaded = ($(selector).height()>0?true:false);
            return componentLoaded;
        },selector);

        console.log("Component Status:" +status);
        if (status == true) {
            processAfterLoad();
            return;
        }
        else {
            setTimeout(function() {
                waitForElementToDisplay(selector, time);
            }, time);
        }
    }

    //open the page
    page.open(settings.url, function (status) {
        var msg = "Page status: " + status;
        console.log(msg);
        return true;
    });

    //take a screenshot and capture current style of the page, so that you can compare it later
    function doWork() {

        var outputLog = page.evaluate(function (settings) {
            var attributes, el, elements, i, output, propertyName, rule, ruleList, rules, style, _i, _j, _k, _len, _ref1, _ref2;

            output = {
                url: location,
                retrieved_at: new Date,
                elements: []
            };
            elements = document.getElementsByTagName("*");
            //settings.outputLog.writeLine("elements " + elements);
            //console.log("elements " + elements);
            for (_i = 0, _len = elements.length; _i < _len; _i++) {
                el = elements[_i];
                style = window.getComputedStyle(el);
                attributes = {};
                for (i = _j = 0, _ref1 = style.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
                    propertyName = style.item(i);
                    attributes[propertyName] = style.getPropertyValue(propertyName);
                }
                ruleList = el.ownerDocument.defaultView.getMatchedCSSRules(el, '') || [];
                rules = [];
                for (i = _k = 0, _ref2 = ruleList.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
                    rule = ruleList[i];
                    rules.push({
                        selectorText: rule.selectorText,
                        parentStyleSheet: rule.parentStyleSheet != null ? rule.parentStyleSheet.href : ''
                    });
                }
                output.elements.push({
                    id: el.id,
                    className: el.className,
                    nodeName: el.nodeName,
                    offsetHeight: el.offsetHeight,
                    offsetWidth: el.offsetWidth,
                    offsetTop: el.offsetTop,
                    offsetLeft: el.offsetLeft,
                    computedStyle: attributes,
                    styleRules: rules
                });
            }
            //settings.outputLog.writeLine(JSON.stringify(output, null, 4));
            return JSON.stringify(output, null, 4);
        }, callSettings);
        // return window.setTimeout((function() {
        //   page.render("./" + output_dir + "/output.png");
        // }), 200);
        settings.outputLog.writeLine(outputLog);

        page.render(settings.output_file);
        return 'success';
    }


}).call(this, settings);

