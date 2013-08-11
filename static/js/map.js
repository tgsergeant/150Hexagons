hist = [];

currentDate = null;
mapData = {};
geodata = null;

svgLoaded = false;

displayAsSVG = true;

TABLE_COLUMNS = 15;
TOTAL_ELECTORATES = 150;

TICK_DELAY = 1000; //Number of milliseconds to wait on a datapoint while playing

playing = false;

/**
* Loads history data, populates slider and requests most
* recent data for display.
*/
function loadHistory() {
    $.getJSON("/data/history.json", function(rawjson) {
        var histdata = rawjson.data;
        geodata = rawjson.geo;

        for(var i = 0; i < histdata.length; i++) {
            var d = new Date(histdata[i]);
            hist.push(d);

        }

        var date_comparator = function(d1, d2) {
            if(d1 > d2) return 1;
            if(d1 < d2) return -1;
            return 0;
        };

        hist.sort(date_comparator);
        //hist.reverse();
        console.log(hist);
        var $slider = $("#slider");
        $slider.slider({
            min: 0,
            max: hist.length - 1,
            step: 1,
            value: hist.length - 1,
            slide: function(event, ui) {
                setPlay(false);
                loadDataForSliderId(ui.value);
                console.log("slide");
            },
            change: function(event, ui) {
                loadDataForSliderId(ui.value);
                console.log("change");
            }
        });
        for(i = 0; i < hist.length; i++) {
            var el = $("<label>" + toPrettyDateString(hist[i]) + "</label>").css("left", (i / (hist.length - 1) * 100) + "%");
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
    return d.getDate() + "/" + (d.getMonth() + 1);
}


function loadDataForSliderId(id) {
//    if(currentDate != toStdDateString(hist[id])) {
        loadDataForDate(hist[id]);
//    }
}

/**
* Loads the data for the given date from cache or remote,
* and displays it on the map
*/
function loadDataForDate(d) {
    var dateStr = toStdDateString(d);
    if(mapData[dateStr] == null) {
        $.getJSON("/data/data-" + dateStr +".json", displayDateData);
    } else {
        displayDateData(mapData[dateStr]);
    }
}

function loadFirstDateData() {
    var dateStr = toStdDateString(hist[hist.length - 1]);
    $.getJSON("/data/data-" + dateStr + ".json", function(data) {
        currentDate = dateStr;
        mapData[dateStr] = data;

        checkBothLoaded();
    });
}

function displayTableData(rawjson, data) {
    for (var j = 0; j <= TOTAL_ELECTORATES; j++) {
        var elec = data[rawjson.order[j] - 1];
        if(!elec) {
            continue;
        }
        var $td = $("#t" + (j + 1));

        var stylestr = "opacity:" + elec.alpha;

        if (elec['colour'] != null) {
            stylestr += ";background-color:" + elec.colour;
        } else {
            if (elec.fav == 'ALP') {
                $td.attr('class', 'fav-alp');
            } else if (elec.fav == 'Coalition') {
                $td.attr('class', 'fav-lib');
            }
        }

        $td.attr("style", stylestr);
    }
}
/**
* Displays a set of raw map data on the map.
*/
function displayDateData(rawjson) {
    if(playing) {
        displayDateDataWithPlay(rawjson);
    } else {
        displayDateDataBasic(rawjson);
    }
}

function displayDateDataBasic(rawjson) {
    var data = rawjson.data;

    if(displayAsSVG) {
        var svgRoot = getMapRoot();

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
    } else { //Display as table
        displayTableData(rawjson, data);
    }
    mapData[rawjson.meta["date-data"]] = rawjson;
    currentDate = rawjson.meta["date-data"];
}

function playTick() {
    if(playing) {
        var $slider = $("#slider");
        var currentIndex = $slider.slider("value");
        console.log('current: ' + currentIndex);
        if(currentIndex == hist.length - 1) {
            //On the final datapoint, pause
            console.log("Finishing up");
            togglePlay();
        }
        else {
            //Simulate slider change
            $slider.slider("value", currentIndex + 1);
        }
    }

}

function displayDateDataWithPlay(rawjson) {
    displayDateDataBasic(rawjson);
    window.setTimeout(playTick, 1000);
}

function mouseoverHandler(node) {
    if(currentDate != null && svgLoaded) {
        var id = $(this).attr("id").substr(1);
        if(!displayAsSVG) {
            id = mapData[currentDate]["order"][id - 1];
        }
        var elec = mapData[currentDate]["data"][parseInt(id) - 1];

        var geo = geodata[id - 1];
        $("dd.electorate-name").text(geo.name);
        $("dd.electorate-description").text(geo.desc + " / " + (geo.metro ? "Metro" : "Regional"));
        var $ddfav = $("dd#electorate-favourite");
        $ddfav.text(elec.fav);
        var favclass = 'fav-name-other';
        if(elec.fav == 'ALP') {
            favclass = 'fav-name-alp';
        } else if(elec.fav == 'Coalition') {
            favclass = 'fav-name-lib';
        }
        $ddfav.attr('class', favclass);
        $("dd.electorate-probability").text(Math.round(elec.p) + "%");
    }
}

function getMapRoot() {
    return document.getElementById("map").getSVGDocument().documentElement;
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
    if (document.getElementById("map").getSVGDocument() != null) {
        svgLoaded = true;
        //Make sure that the data is displayed once the svg is actually loaded
        checkBothLoaded();

        var svgRoot = getMapRoot();

        //Setup SVG
        $("path", svgRoot).each(function(node) {
            $(this).mouseover(mouseoverHandler);
        });

        setupTable();

    }
    else {
        window.setTimeout(checkSVGReady, 100);
    }
}

function setupTable() {
    var NUM_ROWS = TOTAL_ELECTORATES / TABLE_COLUMNS;
    var $table = $("#prob-table");
    for(var row = 0; row < NUM_ROWS; row++) {
        var $tr = $("<tr></tr>");
        for(var col = 0; col < TABLE_COLUMNS; col++) {
            $tr.append("<td id='t" + (col * NUM_ROWS + row + 1) +"'></td>");
        }
        $table.append($tr);
    }
    $("td").on("mouseover", mouseoverHandler);
}

function checkBothLoaded() {
    if(svgLoaded && currentDate != null) {
        $("#loading-box").addClass("hidden");
        $("#main").removeClass("hidden");
        $("#map").removeClass("svg-hidden");
        $("#header").removeClass("loading");


        displayDateData(mapData[currentDate]);
    }
}


//Table related things
$("#display-toggle").on("click", function(e) {
    if(displayAsSVG) {
        $(this).text("Display as map");
        $("#map").addClass("svg-hidden");
        $("#prob-table").removeClass("hidden");
    } else {
        //Currently displaying as a table
        $(this).text("Display as table");
        $("#map").removeClass("svg-hidden");
        $("#prob-table").addClass("hidden");
    }
    $("body").toggleClass("has-table");
    displayAsSVG = !displayAsSVG;
    displayDateData(mapData[currentDate]);
});

function togglePlay() {
    return setPlay(!playing);
}

function setPlay(on) {
    playing = on;
    console.log("Now playing: " + playing);
    if (!playing) {
        $(".play-btn").text("Play");
    }
    else {
        $(".play-btn").text("Pause");
        var position = $("#slider").slider("value");
        console.log("Position: " + position);
        if(position == hist.length - 1) {
            $("#slider").slider("value", 0);
        } else {
            window.setTimeout(playTick, TICK_DELAY);
        }
    }
    return false;
}

$(".play-btn").on("click", togglePlay);



