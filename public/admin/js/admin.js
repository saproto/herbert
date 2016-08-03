$(document).ready(function() {
    var errorElement = $("body");

    var admin = io('/protube-admin');

    // Initialize volume sliders.
    $("#youtubeV").slider().on("slideStop", function(event) {
        admin.emit("setYoutubeVolume", event.value);
    });
    $("#radioV").slider().on("slideStop", function(event) {
        admin.emit("setRadioVolume", event.value);
    });

    // On connect, hide connecting screen and show admin
    admin.on("connect", function() {
        $("#connecting").hide(0);
        $("#connected").show(0);
    });

    // On reconnect, hide connecting screen and show admin
    admin.on("reconnect", function() {
        $("#connecting").hide(0);
        $("#connected").show(0);
    });

    // On disconnect, hide admin and show connecting screen
    admin.on("disconnect", function() {
        $("#connected").hide(0);
        $("#connecting").show(0);
    });

    admin.on("queue", function(data) {
        var queue = $("#queue");
        queue.html("");

        for(var i in data) {
            queue.append('<div class="item" ytId="' + data[i].id + '">' +
            '<img src="http://img.youtube.com/vi/' + data[i].id + '/0.jpg" />' +
            '<div>' +
            '<h1>' + data[i].title + '</h1>' +
            '<h2>' + prettifyDuration(data[i].duration ) + '</h2>' +
            '</div>' +
            '<div style="clear: both;"></div>' +
            '</div>');
        }
    });

    admin.on("ytInfo", function(data) {
        if(!$.isEmptyObject(data)) {
            $("#nowPlaying").html('<img src="http://img.youtube.com/vi/' + data.id + '/0.jpg" width="100px" class="pull-left img-thumbnail" />' +
                '<h1>' + data.title + '</h1>' +
                '<strong>0:00</strong> <input class="slider" id="progress" data-slider-id="progressSlider" type="text" data-slider-min="0" data-slider-max="' + data.duration +
                '" data-slider-step="1" data-slider-value="' + data.progress + '"/> <strong>'+ prettifyDuration(data.duration) +'</strong>');
            $("#progress").slider({
                formatter: function(value) {
                    return prettifyDuration(value);
                }
            }).on("slideStop", function(event) {
                admin.emit("setTime", event.value);
            });
        }else{
            $("#nowPlaying").html("");
        }
    });

    admin.on("progress", function(data) {
        $("#progress").slider('setValue', data);
    });

    $('#searchForm').bind('submit', function(e){
        e.preventDefault();
        admin.emit("search", $("#searchBox").val());
        $("#results").html("Loading...");
    });

    admin.on("searchResults", function(data) {
        var results = $("#searchResults");

        results.html("");

        for(var i in data) {
            results.append(generateResult(data[i]));
        }

        $(".result").each(function(i) {
            var current = $(this);
            current.click(function(e) {
                e.preventDefault();
                admin.emit("add", {
                    id: current.attr("ytId"),
                    showVideo: ($("#showVideo").prop("checked") ? true : false)
                });
            })
        });

        results.show(100);
    });

    $("#clearSearch").click(function(e) {
        e.preventDefault();
        $("#searchResults").hide(0);
        $("#searchBox").val("");
    })

    $("#playpause").click(function(e) {
        e.preventDefault();
        admin.emit("pause");
    });

    $('#searchForm').bind('submit', function(e){
        e.preventDefault();
        admin.emit("search", $("#searchBox").val());
        $("#results").html("Loading...");
    });
    
    admin.on("volume", function(data) {
        $("#youtubeV").slider('setValue', data.youtube);
        $("#radioV").slider('setValue', data.radio);
    })
});

function generateResult(item) {
    var result = '<div class="result" ytId="' + item.id + '">' +
        '<img src="http://img.youtube.com/vi/' + item.id + '/0.jpg" />' +
        '<div>' +
        '<h1>' + item.title + '</h1>' +
        '<h2>' + item.channelTitle +  '</h2>' +
        '<h3>' + item.duration + '</h3>' +
        '</div>' +
        '<div style="clear: both;"></div>' +
        '</div>';

    return result;
}

// Based on http://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
function prettifyDuration(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;

    function str_pad_left(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }

    var finalTime = str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);

    return finalTime;
}