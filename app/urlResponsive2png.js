
(function() {

    var system = require('system');
    var args = system.args;

    if (args[1] == undefined) {
        console.log('Need a URL!');
        phantom.exit();
    }

    var settings = {
        url: args[1], 
        output_dir: (args[2] != undefined ? args[2] : args[1]), 
        zoom: (args[3] != undefined ? args[3] : 1),
        sizes: [
            [375, 667, 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'],
            [320, 568, 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'],
            [320, 480],
            [320, 568],
            [600, 1024],
            [1024, 768],
            [1280, 800],
            [1440, 900]
        ]
    };

    console.log("");
    console.log("Settings:");
    console.log(JSON.stringify(settings));
    console.log("");


    var async = require('async');


    function capture(sizes, callback) {

        console.log("processing: " + JSON.stringify(sizes));

        var page = require('webpage').create();
        var ua = (sizes[3] != undefined ? sizes[3] : '');
        var zoom = (sizes[4] != undefined ? sizes[4] : settings.zoom);
        var w = (sizes[0] != undefined ? sizes[0] : 375);
        var h = (sizes[1] != undefined ? sizes[1] : 667);
        
        if (ua!='') {
            page.settings.userAgent = ua;    
        }
        
        page.onConsoleMessage = function(msg) {
        return console.log(msg);
        };

        page.viewportSize = {
            width: w,
            height: h
        };
        page.zoomFactor = 5;
        page.open(settings.url, function (status) {
            var filename = sizes[0] + 'x' + sizes[1] + '.png';
            page.render("./" + settings.output_dir +  "/" + filename);
            page.close();
            callback.apply();
        });
    }

    function getZoom(outerWidth,innerWidth) {

        var snap = function (r, snaps, ratios)
        {
            var i;
            for (i=0; i < 16; i++) { if ( r < snaps[i] ) return eval(ratios[i]); }
        };
        var w, l, r;
        w = window.outerWidth, l = window.innerWidth;
        return snap((w - 16) / l,
                    [ 0.29, 0.42, 0.58, 0.71, 0.83, 0.95, 1.05, 1.18, 1.38, 1.63, 1.88, 2.25, 2.75, 3.5, 4.5, 100 ],
                    [ 0.25, '1/3', 0.5, '2/3', 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5 ]
        );

    }

    console.log("Starting:");
    async.eachSeries(settings.sizes, capture, function (e) {
        if (e) console.log(e);
        console.log('done!');
        phantom.exit();
    });



}).call(this);