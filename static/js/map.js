hist = [];

currentDate = null;
mapData = {};

svgLoaded = false;

displayAsSVG = true;

/**
 * Loads history data, populates slider and requests most
 * recent data for display.
 */
function loadHistory() {
    $.getJSON("data/history.json", function(rawjson) {
        var histdata = rawjson.data;

        for(var i = 0; i < histdata.length; i++) {
            var d = new Date(histdata[i]);
            hist.push(d);

        }
        hist.sort();
        hist.reverse();
        console.log(hist);

        var $slider = $("#slider");
        $slider.slider({
            min: 1,
            max: hist.length,
            values: [hist.length],
            slide: function(event, ui) {
                loadDataForSliderId(ui.value);
            }
        });

        for(i = hist.length - 1; i >= 0; i--) {
            var el = $("<label>" + toPrettyDateString(hist[i]) + "</label>").css("left", ((hist.length - 1 - i) / (hist.length - 1) * 100) + "%");
            $slider.append(el);
        }

        $(".hist-swap-link").on("click", function() {
            loadDataForDate(hist[$(this).attr("data-id")]);
            console.log("Clicked");
            return false;
        });

        loadFirstDateData();
    });
}

/**
 * Converts a date into a standard ISO representation
 */
function toStdDateString(d) {
    function pad(number) {
        var r = String(number);
        if ( r.length === 1 ) {
            r = '0' + r;
        }
        return r;
    }
    return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
}

function toPrettyDateString(d) {
    return d.getDate() + "/" + d.getMonth();
}


function loadDataForSliderId(id) {
    console.log("Loading");
    loadDataForDate(hist[hist.length - id]);
}

/**
 * Loads the data for the given date from cache or remote,
 * and displays it on the map
 */
function loadDataForDate(d) {
    var dateStr = toStdDateString(d);
    if(mapData[dateStr] == null) {
        $.getJSON("data/data-" + dateStr +".json", displayDateData);
    } else {
        displayDateData(mapData[dateStr]);
    }
}

function loadFirstDateData() {
    var dateStr = toStdDateString(hist[0]);
    $.getJSON("data/data-" + dateStr + ".json", function(data) {
        currentDate = dateStr;
        mapData[dateStr] = data;

        checkBothLoaded();
    });
}

/**
 * Displays a set of raw map data on the map.
 */
function displayDateData(rawjson) {
    var svgRoot = getMapRoot();
    var data = rawjson.data;

    for(var i = 0; i < data.length; i++) {
        var elec = data[i];
        var $path = $("#" + elec.id, svgRoot);
        var stylestr = "fill-opacity:" + elec.alpha;

        if(elec['colour'] != null) {
            stylestr += ";fill:" + elec.colour;
        } else {
            if(elec.fav == 'ALP') {
                $path.attr('class', 'fav-alp');
            } else if(elec.fav == 'Coalition') {
                $path.attr('class', 'fav-lib');
            }
        }
        $path.attr("style", stylestr);
    }
    mapData[rawjson.meta["date-data"]] = rawjson;
    currentDate = rawjson.meta["date-data"];
}

function mouseoverHandler(node) {
    if(currentDate != null && svgLoaded) {
        var id = $(this).attr("id").substr(1);
        var elec = mapData[currentDate]["data"][parseInt(id) - 1];
        $("dd.electorate-name").text(elec.name);
        $("dd.electorate-favourite").text(elec.fav);
        $("dd.electorate-probability").text(Math.round(elec.p) + "%");
    }
}

function getMapRoot() {
    return document.getElementById("map").contentDocument.documentElement;
}

/**
 * Waits until the SVG has loaded, and then attaches event listeners to
 * the hexes.
 *
 * Fixed a bug in how I was embedding the SVG, absolutely could not get
 * the event listener to work again. I might try later, otherwise this
 * timeout method will have to do.
 */
function checkSVGReady() {
    if (document.getElementById("map").contentDocument != null) {
        svgLoaded = true;
        //Make sure that the data is displayed once the svg is actually loaded
        checkBothLoaded();

        var svgRoot = getMapRoot();

        $("path", svgRoot).each(function(node) {
            $(this).mouseover(mouseoverHandler);
        })
    }
    else {
        window.setTimeout(checkSVGReady, 100);
    }
}

function checkBothLoaded() {
    if(svgLoaded && currentDate != null) {
        $("#loading-box").addClass("hidden");
        $("#main").removeClass("hidden");

        displayDateData(mapData[currentDate]);
    }
}

