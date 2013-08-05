hist = [];

mapData = {};

svgLoaded = false;
waitingOnSvg = false;

currentDate = null;

/**
 * Loads history data, populates slider and requests most
 * recent data for display.
 */
function loadHistory() {
    $.getJSON("data/history.json", function(rawjson) {
        var histdata = rawjson.data;
        var $links = $("#hist-links");
        var childhtml = ""
        for(var i = 0; i < histdata.length; i++) {
            var d = new Date(histdata[i]);
            hist.push(d);

        }
        hist.sort();
        hist.reverse();
        console.log(hist);

        for(i = 0; i < hist.length; i++) {
            childhtml += "<p><a href='#' class='hist-swap-link' data-id='"+i+"'>" + toStdDateString(hist[i]) + "</a></p>";
        }

        $links.html(childhtml);

        $(".hist-swap-link").on("click", function() {
            loadDataForDate(hist[$(this).attr("data-id")]);
            console.log("Clicked");
            return false;
        });


        latest = hist[0];
        loadDataForDate(latest);
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

/**
 * Loads the data for the given date from cache or remote,
 * and displays it on the map
 */
function loadDataForDate(d) {
    var dateStr = toStdDateString(d);
    if(mapData[dateStr] == null) {
        $.getJSON("data/data-" + dateStr +".json", displayDateData);
    } else {
        console.log("Loading from memory");
        displayDateData(mapData[dateStr]);
    }
}

/**
 * Displays a set of raw map data on the map.
 */
function displayDateData(rawjson) {
    if(svgLoaded) {
        var svgRoot = getMapRoot();
        var data = rawjson.data;

        for(var i = 0; i < data.length; i++) {
            var elec = data[i];
            var $path = $("#" + elec.id, svgRoot);
            $path.attr("style", "fill:"+ elec.colour + ";fill-opacity:" + elec.alpha);
        }
    }
    else {
        console.log("Svg not ready to display data");
        waitingOnSvg = true;
    }
    mapData[rawjson.meta["date-data"]] = rawjson;
    currentDate = rawjson.meta["date-data"];
}

function mouseoverHandler(node) {
    if(currentDate != null && svgLoaded) {
        var id = $(this).attr("id").substr(1);
        var name = mapData[currentDate]["data"][parseInt(id)]["name"];
        $("#name").text(name);
    }
}

function getMapRoot() {
    return document.getElementById("map").contentDocument.documentElement;
}

/**
 * Waits until the SVG has loaded, and then attaches event listeners to
 * the hexes.
 */
function setupMap() {
    var m = document.getElementById('map');
    m.addEventListener("load", function() {
        svgLoaded = true;

        //Make sure that the data is displayed once the svg is actually loaded
        if(waitingOnSvg) {
            displayDateData(mapData[currentDate]);
        }

        var svgRoot = getMapRoot();

        $("path", svgRoot).each(function(node) {
            $(this).mouseover(mouseoverHandler);
        })
    })

}



