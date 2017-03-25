var announcements = [];
var aContainer = $(".announcements-container");
var refresh = $("#refreshAnnouncements");

$(document).ready(function(){
    getAnnouncements();
});

function getAnnouncements(){
    $.ajax({
        url : "/v1/announcements",
        type: "GET",
        dataType: "json",
        success: function(response){
            refresh.toggleClass(".fa-spin");
            var now = new Date().getTime() / 1000;
            response.results.forEach(function(a){
                if(a.approved && a.broadcast_at <= now) {
                    announcements.push({
                        title: a.title,
                        info: a.info,
                        time: new Date(a.broadcast_at * 1000),
                        category: a.category
                    });
                }
            });
        },
        complete: function(response){
            announcements.sort(announcementSorter);
            displayAnnouncements();
            refresh.toggleClass(".fa-spin");
        },
        error: function(xhr, errmsg, err){
            console.error("Encountered Error: " + errmsg + "\n" + xhr.status + ": " + xhr.responseText);
            refresh.toggleClass(".fa-spin");
        }
    });
}

function announcementSorter(a, b){
    return b.time - a.time;
}

function formatDate(d){
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d.getDay()] + " " + (d.getMonth() + 1) + "-" + ("0" + d.getDate()).slice(-2) + ", "
        + (d.getHours() % 12) + ":" + ("0" + d.getMinutes()).slice(-2) + (d.getHours() >= 12 ? "pm" : "am");
}

function displayAnnouncements(){
    announcements.forEach(function(a, idx){
        aContainer.append(
            "<div class='announcement'>" +
                "<div class='announcement-details category-" + mapCategoryIndex(a.category) + "'>" +
            "<div class='event-title'><h2>" + a.title + "</h2><span class='category-identifier'>" + formatAnnouncementCategoryIdentifier(a.category) + "</span></div>" +
                    "<h3>" + formatDate(a.time) + "</h3>" +
                    "<p>" + a.info + "</p>" +
                "</div>" +
            "</div>"
        );
    });
}

refresh.click(function(){
    $(".announcement").remove();
    announcements = [];
    getAnnouncements();
});

function mapCategoryIndex(category) {
    switch (category) {
        case 1:
            return 0;
        case 2:
            return 1;
        case 4:
            return 2;
        case 8:
            return 3;
    }

    return 0;
}

function formatAnnouncementCategoryIdentifier(category) {
    switch (category) {
        case 1:
            return "Emergency";
        case 2:
            return "Logistics";
        case 4:
            return "Food";
        case 8:
            return "Event";
        case 16:
            return "Sponsor";
    }

    return "Other";
}
