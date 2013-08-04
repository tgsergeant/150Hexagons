hist = [];

mapData = {};

function loadHistory() {
    $.getJSON("data/history.json", function(histdata) {
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

function loadDataForDate(d) {
    var dateStr = toStdDateString(d);
    if(mapData[dateStr] == null) {
        $.getJSON("data/data-" + dateStr +".json", displayDateData(dateStr));
    } else {
        console.log("Loading from memory");
        displayDateData(dateStr)(mapData[dateStr]);
    }
}

function displayDateData(dateStr) {
    return function(data) {
        var svgRoot = document.getElementById("map").contentDocument.documentElement;

        for(var i = 0; i < data.length; i++) {
            var elec = data[i];
            var $path = $("#" + elec.id, svgRoot);
            $path.attr("style", "fill:"+ elec.colour + ";fill-opacity:" + elec.alpha);
            $path.attr("data-name", elec.name);
            $path.mouseover(function(event) {
                $("#name").text($(this).attr("data-name"));
            })
        }
        mapData[dateStr] = data;
    };
}



