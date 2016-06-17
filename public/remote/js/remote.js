$(document).ready(function() {
    var errorElement = $("body");

    var remote = io('/protube-remote');

    remote.on("connect", function() {
        $("#connecting").hide(0);
        $("#connected").show(0);
    });

    remote.on("reconnect", function() {
        location.reload();
    });

    remote.on("disconnect", function() {
        location.reload();
    });

    remote.on("queue", function(data) {
        var queue = $("#queue");
        queue.html("");

        for(var i in data) {
            queue.append('<img src="http://img.youtube.com/vi/' + data[i].id + '/0.jpg" />');
        }
    });

    $('form').bind('submit', function(e){
        e.preventDefault();
        remote.emit("search", $("#searchBox").val());
        $("#results").html("Loading...");
    });

    $("#pincode").html("");

    $('.keyboard-key').on('click', function(){
        errorElement.css({
            "-moz-animation": "none",
            "-webkit-animation": "none",
            "animation": "none"
        });

        var pincode = $("#pincode");

        if($(this).hasClass('back')) {
            pincode.html( pincode.html().substring(0, pincode.html().length-1) );
        } else {
            if(pincode.html().length < 3) {
                pincode.html( pincode.html() + $(this).html() );
            }
        }

        if( pincode.html().length == 3 ) {
            remote.emit("authenticate", { 'pin' : pincode.html() });
        }

    });

    $('body').on('keydown', function(event){
        if( $('#login').is(':visible') ) {
            if(event.keyCode >= 48 && event.keyCode <= 57 ) { // 0-9 normal
                $('.keyboard-key:contains("' + (event.keyCode - 48) + '")').click();
            } else if(event.keyCode >= 96 && event.keyCode <= 105 ) { // 0-9 normal
                $('.keyboard-key:contains("' + (event.keyCode - 96) + '")').click();
            } else if( event.keyCode == 8 ) { // backspace
                $('.keyboard-key.back').click();
            }
        }
    });

    remote.on("authenticated", function(correct) {
        if(correct) {
            $("#login").hide(0);
            $("#loggedIn").show(0);
        }else{
            $(errorElement).css({
                "-moz-animation": "error 0.5s",
                "-webkit-animation": "error 0.5s",
                "animation": "error 0.5s"
            });
            $("#pincode").html("");
        }
    });

    remote.on("searchResults", function(data) {
        var results = $("#results");

        results.html("");

        for(var i in data) {
            results.append(generateResult(data[i]));
        }

        $(".result").each(function(i) {
            var current = $(this);
            current.click(function(e) {
                e.preventDefault();
                remote.emit("add", { id: current.attr("ytId")});
            })
        });
    });
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