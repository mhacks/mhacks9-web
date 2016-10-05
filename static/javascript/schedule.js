var eventsDiv = $(".events");
var timeLines = $(".time-lines");
var timeStamps = $(".time-stamps");
var numEvents = [];
var placedEvents = [];
var doResizeEvents;
var numLines = 107;
var baseTime = new Date("2016-10-07T19:00:00.000Z");
var endTime = new Date("2016-10-10T00:00:00.000Z");

var locations = [];
var events = [];

// Flip this flag to make the schedule not show old events (the time markers will start from the current time)
var displayOld = true;

$(document)
    .ready(function(){
        if(!displayOld) {
            var currentTime = new Date();
            if (3600000 * Math.floor(currentTime / 3600000) > baseTime) {
                baseTime = 3600000 * Math.floor(currentTime / 3600000);
            }
            numLines = (endTime - baseTime) / 1800000 + 1;
            numLines = (numLines < 0) ? 0 : numLines;
        }

        drawMarkers();

        for(var i = 0; i < numLines; ++i){
            numEvents[i] = 0;
            placedEvents[i] = 0;
        }

        getLocations();
        getEvents();
    })
    .on('mouseenter', '.event', function(){
        $(this).css("min-width", Math.floor(timeLines.width() - 20) + "px").addClass("shiftLeft");
    })
    .on('mouseleave', '.event', function(){
        $(this).css("min-width", 0).removeClass("shiftLeft");
    });

$(window).resize(function(){
    clearTimeout(doResizeEvents);
    doResizeEvents = setTimeout(resizeEvents(), 200);
});

function getLocations(){
    $.ajax({
        url : "/v1/locations",
        type: "GET",
        dataType: "json",
        success: function(response){
            response.results.forEach(function(l){
                locations[l.id] = {name: l.name, floor: l.floor};
            });

        },
        error: function(xhr, errmsg, err){
            console.error("Encountered Error: " + errmsg + "\n" + xhr.status + ": " + xhr.responseText);
        }
    });
}

function getEvents(){
    $.ajax({
        url : "/v1/events",
        type: "GET",
        dataType: "json",
        success: function(response){
            response.results.forEach(function(e){
                if(e.approved) {
                    events.push({
                        startTime: e.start * 1000,
                        endTime: e.start * 1000 + e.duration,
                        locations: e.locations,
                        name: e.name,
                        description: e.info,
                        category: e.category
                    });
                }
            });
            console.log(response.results);
            console.log(events);
            processEvents();
        },
        error: function(xhr, errmsg, err){
            console.error("Encountered Error: " + errmsg + "\n" + xhr.status + ": " + xhr.responseText);
        }
    });
}

function processEvents(){
    parseAllEvents();

    events.forEach(function(e){
        if(!e.expired) {
            var p = getPosition(e);
            //console.log(e.rawOffset + "\t" + e.rawHeight);

            var width = numEvents[Math.floor(e.rawOffset)];
            for (var i = Math.floor(e.rawOffset) + 1; i < Math.ceil(e.rawOffset + e.rawHeight); ++i) {
                if (numEvents[i] > width) {
                    width = numEvents[i];
                }
            }

            var offset = -1;
            for (i = 0; offset == -1 && i < width; ++i) {
                var validSpot = true;
                // Check if spot i is valid for all spots along the height of the event card
                for (var j = Math.floor(e.rawOffset); validSpot && j < Math.ceil(e.rawOffset + e.rawHeight); ++j) {
                    if (((1 << i) & placedEvents[j]) != 0) {
                        validSpot = false;
                    }
                }
                if (validSpot) {
                    offset = i;
                    for (j = Math.floor(e.rawOffset); j < Math.ceil(e.rawOffset + e.rawHeight); ++j) {
                        placedEvents[j] += (1 << i);
                    }
                }
            }

            if (offset == -1) {
                console.error("Error placing event:");
                console.error(e);
                return;
            } else {
                ++offset;
            }

            //console.log(offset + "\t" + width);

            eventsDiv.append(
                "<div class='event width-" + width + " offset-" + offset + " category-" + e.category + "' style='top:" + p.offset + "px; min-height: " + p.height + "px'>" +
                    "<h2>" + e.name + "</h2>" +
                    "<h3>" + formatTime(new Date(e.startTime)) + " - " + formatTime(new Date(e.endTime)) + "</h3>" +
                    "<h3>" + formatLocations(e.locations) + "</h3>" +
                    "<p>" + e.description + "</p>" +
                "</div>");
        }
    });
    resizeEvents();
    //console.log(numEvents);
}

function parseAllEvents(){
    console.log(events.length);
    events.forEach(function(e){
        var start = new Date(e.startTime);
        var end = new Date(e.endTime);

        if(end >= baseTime) {
            if(start < baseTime){
                start = baseTime;
            }

            e.expired = false;

            e.rawOffset = (start.getTime() - baseTime.getTime()) / 1800000;
            e.rawHeight = (end.getTime() - start.getTime()) / 1800000;
            //console.log(start.getTime() + "\t" + end.getTime() + "\t" + e.rawHeight);

            for (var i = Math.floor(e.rawOffset); i < Math.ceil(e.rawOffset + e.rawHeight); ++i) {
                numEvents[i]++;
            }
        } else {
            e.expired = true;
        }
    });
}

function getPosition(e){
    var pixelOffset = 40 * e.rawOffset;
    var pixelHeight = 40 * e.rawHeight;

    return {offset: pixelOffset, height: pixelHeight};
}

function resizeEvents(){
    var width = timeLines.width() - 20;// * (120 - timeStamps.width());
    var baseOffset = timeStamps.width() + 25;

    $(".offset-1").css("left", Math.floor(baseOffset) + "px");
    $(".width-2.offset-2").css("left", Math.floor(baseOffset + (width - 10)/2 + 10) + "px" );
    $(".width-3.offset-2").css("left", Math.floor(baseOffset + (width - 20)/3 + 10) + "px" );
    $(".width-3.offset-3").css("left", Math.floor(baseOffset + 2 * (width - 20)/3 + 20) + "px" );

    $(".width-1").css("width", Math.floor(width) + "px");
    $(".width-2").css("width", Math.floor((width - 10)/2) + "px");
    $(".width-3").css("width", Math.floor((width - 20)/3) + "px");

    //console.log(width);
}

function drawMarkers(){
    var hour = baseTime.getHours();
    var am = (hour < 12);
    var day = 0;
    for(var i = 0; i < numLines; ++i){
        timeLines.append("<div></div>");
        if(i % 2 == 0){
            var time = "";
            if(i == 0 || hour == 0){
                switch(day){
                    case 0:
                        time += "Fri. ";
                        break;
                    case 1:
                        time += "Sat. ";
                        break;
                    case 2:
                        time += "Sun. ";
                        break;
                }
            }
            time += ((hour % 12 == 0) ? 12 : (hour % 12))/* + ":00 "*/;
            time += (am) ? " am" : " pm";
            timeStamps.append("<p>" + time + "</p>");

            ++hour;
            if(hour % 12 == 0){
                am = !am;
            }
            if(hour >= 24){
                hour -= 24;
                ++day;
            }
        } else {
            timeStamps.append("<p></p>");
        }
    }

    /*$(".container").css("height", $(".time-markers").css("height"));*/
    eventsDiv.css("top", "-" + timeLines.height() + "px");
}

function formatTime(d){
    return (d.getHours() % 12) + ":" + ("0" + d.getMinutes()).slice(-2) + (d.getHours() >= 12 ? "pm" : "am");
}

function formatLocations(locs){
    var output = "";
    locs.forEach(function(l, idx){
        output += ((idx == 0) ? "" : ", ") + locations[l].name + " [" + locations[l].floor + "]";
    });
    return output;
}